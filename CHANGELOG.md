# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-07-09

### Changed

- Added `peerDependenciesMeta` to document that `express` is required
- Bumped version for supply-chain and CI/CD improvements publish

### Added

- README "Dependencies" section explaining peer dependency model
- Publish workflow guard to prevent republishing an existing version
- Fixed CI publish-content verification (nested tarball detection)

### Fixed

- CI workflow now runs on `production` branch pushes and PRs

## [0.1.1] - 2026-07-09

### Changed

- Moved `express` from runtime dependency to `peerDependency`
- Added `repository`, `homepage`, and `bugs` fields to `package.json`
- Added explicit `files` whitelist for published package contents
- Added `engines.node` requirement (`>=18`)
- Made optional `RateLimitOptions` fields optional in TypeScript types
- Updated README to use correct package name (`req-guard-lite`)

### Added

- MIT `LICENSE` file
- `SECURITY.md` vulnerability reporting policy
- Automated tests with Node.js built-in test runner
- GitHub Actions CI workflow (build + test)
- GitHub Actions publish workflow with npm provenance

### Fixed

- Removed accidental nested `.tgz` from publish artifacts
- Prevented future `.tgz` inclusion via `.gitignore` and `.npmignore`

## [0.1.0] - 2025-12-14

### Added

- Initial release with in-memory IP-based rate limiting middleware for Express

[0.1.2]: https://github.com/ameenhyder-v/req-guard-lite/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/ameenhyder-v/req-guard-lite/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/ameenhyder-v/req-guard-lite/releases/tag/v0.1.0
