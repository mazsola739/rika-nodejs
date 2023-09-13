# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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