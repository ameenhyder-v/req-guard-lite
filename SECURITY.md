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


# Security Policy

Thank you for helping keep **req-guard-lite** secure. We appreciate responsible security research and encourage the community to report potential vulnerabilities.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.2  | ✅ Yes     |

Only the latest released version receives security updates. Please upgrade to the newest version before reporting issues on older releases.

## Reporting a Vulnerability

If you believe you have found a security vulnerability, **please do not disclose it publicly** by creating a GitHub issue.

Instead, report it privately by emailing **[ameenhyder.v@gmail.com](mailto:ameenhyder.v@gmail.com)** with as much information as possible, including:

* A clear description of the vulnerability
* Steps to reproduce the issue
* Proof of concept (if available)
* Potential impact
* Suggested mitigation or fix (optional)

### What to Expect

* Initial acknowledgment within **72 hours**
* Investigation and validation of the report
* Updates on progress when possible
* A security fix released as soon as practical for confirmed vulnerabilities

We ask that you keep the vulnerability confidential until a fix has been released.

## Contributing to Security

Security improvements from the community are always welcome. You can contribute by:

* Reviewing the code for potential security issues
* Improving validation and error handling
* Enhancing documentation and security guidance
* Submitting pull requests for non-sensitive security improvements

For vulnerabilities that could impact users, please follow the private disclosure process above instead of opening a public pull request.

## Security Practices

This project follows several security best practices:

* Automated testing and publishing through GitHub Actions
* npm package provenance enabled for verified releases
* Minimal runtime dependencies
* `express` is a peer dependency, allowing applications to manage and audit their own Express version
* Semantic versioning for releases and security patches

Thank you for helping make **req-guard-lite** safer for everyone.
