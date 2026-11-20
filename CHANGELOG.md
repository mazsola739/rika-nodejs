# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2.0.0] - 2026-11-20

### Added

- Module 7 finished: the checkout API on SQLite (`node:sqlite`) instead of the unfinished PostgreSQL + MikroORM draft.
- Tests for every module (`bun:test`); the checkout API tests run on both the in-memory and the SQLite store.
- A project page on GitHub Pages where most of the modules run in the browser.
- Biome, and a GitHub Actions workflow that lints, type checks, tests, builds and deploys.

### Fixed

- A `once` listener no longer makes the next listener skip its turn.
- The random number can be the upper bound of the range.
- The activity monitor no longer blocks on a PowerShell call every 100 ms, and shows real megabytes on macOS and Linux.
- A new user never gets the id of another user after a delete.
- A product can be taken out of the cart with `count: 0`, as the API description asks.

### Changed

- Rewritten in strict TypeScript with ES modules, run with Bun; one `package.json` instead of one per module.
- `fetch` instead of axios, an own streaming CSV parser instead of csvtojson, Express 5 instead of Express 4.
- The users API (module 5): `PATCH /users/:id`, `POST /users/:id/hobbies` and `DELETE /users/:id/hobbies/:hobby`, 404 for missing users, 405 with `Allow` for wrong methods.
- The checkout API (module 6): the routes are described once as data; the responses follow the OpenAPI description.

### Removed

- The screenshots of the terminal (they are in the `v2023` tag), nodemon, ts-node, Jest and the GitLab CI file.

## [1.5.0] - 2023-10-11

### Added

- Implemented express checkout service application which sells different types of products

### Fixed

- None.

### Changed

- Redesigned module-5 using ts-node.

### Removed

- None.

## [1.4.0] - 2023-10-04

### Added

- Implemented server with REST API for users and their hobbies

### Fixed

- None.

### Changed

- None.

### Removed

- None.

## [1.3.0] - 2023-09-20

### Added

- Implemented unit, integration and E2E tests for public holiday service

### Fixed

- None.

### Changed

- None.

### Removed

- None.

## [1.2.0] - 2023-09-13

### Added

- Task 1: implemented event emitter and wrote tests to ensure proper functionality
- Task 2: event emitter extended with elapsed time measurement
- Task 3: created CSV to TXT converter using csvtojson package

### Fixed

- None.

### Changed

- Created separate 'screenshots' folders for each module to improve organization.

### Removed

- None.

## [1.1.0] - 2023-09-06

### Added

- Added CPU monitor that displays the most CPU-intensive process and logs it to a file every minute.

### Fixed

- None.

### Known issues

- When running the CPU monitor, the user must run the program in Administrator mode to see system processes. Additionally, the CPU usage may not be calculated perfectly due to limitations in the calculation method.

### Changed

- Changed folder structure to create separate folders for each module.
- Changed the command to start the program from 'npm start' to 'activityMonitor.js' from the module-2 folder for clarity and consistency.
- Changed the command to run the program from 'npm random' to 'node index.js' from the module-1 folder.

### Removed

- None.

## [1.0.0] - 2023-08-30

### Added

- Created initial project structure and files.
- Added nodemon support.
- Added random number generator inside REPL.

### Fixed

- None.

### Changed

- None.

### Removed

- None.
