// SBOM 신원 검증 — 이 저장소의 SBOM이 정말 이 앱의 것인지만 확인한다.
//
// 왜 재생성 후 diff가 아니라 신원 검증인가:
// CycloneDX의 metadata.timestamp, SPDX의 documentNamespace(UUID), tools의 npm CLI 버전은
// 실행할 때마다 달라진다. "재생성 후 git diff --exit-code"는 상시 red를 만든다.
// 반면 아래 4개 필드는 완전히 결정적이고, 스캐폴딩 복사로 남의 앱 SBOM이 박히는 오염
// (예: house/biz/loan에 seller-fee-compare가 들어간 2026-03-16 사고)을 정확히 잡아낸다.
//
// SBOM 파일이 없으면 no-op(exit 0)이라 12개 앱에 같은 스니펫을 그대로 붙일 수 있다.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cyclonedxPath = resolve(projectRoot, "artifacts", "sbom", "production.cyclonedx.json");
const spdxPath = resolve(projectRoot, "artifacts", "sbom", "production.spdx.json");

if (!existsSync(cyclonedxPath)) {
  console.log("verify-sbom-identity: no SBOM present, skipping");
  process.exit(0);
}

const pkg = readJson(resolve(projectRoot, "package.json"));
const cyclonedx = readJson(cyclonedxPath);
const component = cyclonedx.metadata?.component ?? {};
const errors = [];

check("cyclonedx metadata.component.name", component.name, pkg.name);
check("cyclonedx metadata.component.version", component.version, pkg.version);

// vcs 참조는 저장소 자체를 가리켜야 한다 — 이름이 같아도 남의 저장소 SBOM이면 여기서 걸린다.
const expectedRepoUrl = resolveRepositoryUrl();
if (expectedRepoUrl) {
  const vcs = (component.externalReferences ?? []).find((reference) => reference.type === "vcs");
  check("cyclonedx vcs externalReference", vcs?.url?.replace(/\.git$/, ""), expectedRepoUrl);
}

if (existsSync(spdxPath)) {
  const spdx = readJson(spdxPath);
  const rootId = spdx.documentDescribes?.[0];
  const rootPackage = spdx.packages?.find((item) => item.SPDXID === rootId) ?? spdx.packages?.[0];
  check("spdx root package name", rootPackage?.name, pkg.name);
}

if (errors.length > 0) {
  console.error(`verify-sbom-identity: FAILED\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`verify-sbom-identity: OK (${pkg.name}@${pkg.version})`);

function check(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function resolveRepositoryUrl() {
  // CI에서는 GITHUB_REPOSITORY가 진실. 로컬에서도 돌도록 git remote로 대체한다(네트워크 불필요).
  if (process.env.GITHUB_REPOSITORY) {
    return `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  }

  try {
    const raw = execFileSync("git", ["config", "--get", "remote.origin.url"], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    return raw.startsWith("git@github.com:")
      ? `https://github.com/${raw.slice("git@github.com:".length).replace(/\.git$/, "")}`
      : raw.replace(/\.git$/, "");
  } catch {
    return "";
  }
}
