# ShakiLabs UI artifact

`shakilabs-ui-0.3.11.tgz` is the active exact artifact for `@shakilabs/ui` 0.3.11.

- Source repository: `00.root-shakilabs`
- Source commit: `657cf80b72ef4a977b7b34e765b8ddb4ce9fbef7`
- SHA-256: `2c9587d9fd74af697f0a95bc50e39bccf169fb48dcebf37afe5991926b713b54`
- Rollback artifacts: available from Git history when needed

Only the active exact artifact is committed so an isolated Vercel checkout can run `npm ci` without a private registry token.

## Verification

This file is a supply-chain record, not just documentation: the version above and the hash above are what an
auditor checks the committed tarball against. CI enforces the match on every run.

```sh
cd client && npm run verify:supply-chain
```

The check fails when the tarball, the SHA-256 recorded here, or the `file:vendor/...` reference in
`client/package.json` disagree — so bumping `@shakilabs/ui` requires updating this file in the same commit.
