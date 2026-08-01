// vendor tgz 무결성 기록 검증 — README가 실제 커밋된 아티팩트와 어긋나지 않게 한다.
//
// 왜 필요한가: vendor/README.md는 단순 문서가 아니라 공급망 기록이다(버전 + SHA-256).
// UI 패키지를 올리면서 README를 빼먹으면 무결성을 검증하려는 사람에게 오답을 준다.
// 실제로 9개 앱이 0.3.7 해시를 적어둔 채 0.3.10/0.3.11 tgz를 커밋한 상태였다.
//
// vendor 디렉터리가 없으면 no-op(exit 0)이라 12개 앱에 같은 스니펫을 그대로 붙일 수 있다.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = resolve(projectRoot, "vendor");

if (!existsSync(vendorDir)) {
  console.log("verify-vendor-artifacts: no vendor directory, skipping");
  process.exit(0);
}

const tarballs = readdirSync(vendorDir).filter((name) => name.endsWith(".tgz"));

if (tarballs.length === 0) {
  console.log("verify-vendor-artifacts: no vendored tarballs, skipping");
  process.exit(0);
}

const readmePath = resolve(vendorDir, "README.md");
const errors = [];

if (!existsSync(readmePath)) {
  fail("client/vendor/README.md is missing while tarballs are committed");
}

const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";
const documentedTarballs = new Set(readme.match(/[\w.@-]+\.tgz/g) ?? []);
const documentedHashes = new Set(readme.match(/\b[0-9a-f]{64}\b/g) ?? []);
const actualHashes = new Set();

for (const tarball of tarballs) {
  const sha256 = createHash("sha256").update(readFileSync(resolve(vendorDir, tarball))).digest("hex");
  actualHashes.add(sha256);

  if (!documentedTarballs.has(tarball)) {
    fail(`${tarball} is committed but not documented in vendor/README.md`);
  }

  if (!documentedHashes.has(sha256)) {
    fail(`${tarball} SHA-256 ${sha256} is not recorded in vendor/README.md`);
  }
}

// README에만 남은 옛 파일명/해시 = 버전만 올리고 문서를 안 고친 드리프트.
for (const documented of documentedTarballs) {
  if (!tarballs.includes(documented)) {
    fail(`vendor/README.md documents ${documented}, which is not committed in client/vendor/`);
  }
}

for (const documented of documentedHashes) {
  if (!actualHashes.has(documented)) {
    fail(`vendor/README.md records SHA-256 ${documented}, which matches no committed tarball`);
  }
}

// package.json의 file:vendor/... 참조도 실제 파일과 일치해야 npm ci가 재현된다.
const pkg = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8"));

for (const [name, spec] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  if (typeof spec !== "string" || !spec.startsWith("file:vendor/")) {
    continue;
  }

  const referenced = spec.slice("file:vendor/".length);

  if (!tarballs.includes(referenced)) {
    fail(`package.json depends on ${name} -> ${spec}, but client/vendor/${referenced} does not exist`);
  }
}

if (errors.length > 0) {
  console.error(`verify-vendor-artifacts: FAILED\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`verify-vendor-artifacts: OK (${tarballs.join(", ")})`);

function fail(message) {
  errors.push(message);
}
