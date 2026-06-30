# release-change-bot

Automated running of release-change

![License: MIT](https://img.shields.io/github/license/release-change/bot)
[![ESM-only package](https://img.shields.io/badge/package-ESM--only-ffe536)](https://nodejs.org/api/esm.html)
[![Conventional Commits 1.0.0](https://img.shields.io/badge/Conventional_Commits-1.0.0-fe5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
![Build status](https://img.shields.io/github/actions/workflow/status/release-change/bot/run-tests.yml)

**release-change-bot** is a GitHub App which runs [release-change](https://github.com/release-change/release-change) when any changes in the codebase are pushed to any of the branches on which releases should happen. If a release is made, it then creates a release pull request and comments on the issues and pull requests which are concerned by the release.

## Installation

Install the bot from the [GitHub Apps marketplace](https://github.com/apps/release-change).

## Copyright & licence

© 2026 Victor Brito — Released under the [MIT licence](./LICENSE).
