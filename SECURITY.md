# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in `req-guard-lite`, please report it responsibly.

**Do not** open a public GitHub issue for security bugs.

Instead, email **ameenhyder.v@gmail.com** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

You can expect an initial response within **72 hours**. If the report is accepted, a fix will be prioritized and released as a patch version.

## Security Practices

- Releases are built and tested in GitHub Actions before publishing
- npm [provenance](https://docs.npmjs.com/generating-provenance-statements) is enabled for published packages
- `express` is a peer dependency — install it from your own trusted lockfile
