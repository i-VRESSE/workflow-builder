# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## @i-vresse/wb-core 3.1.0 - 2024-08-13

### Added

* Hook useSaveWithGlobalRewrite() ([#161](https://github.com/i-VRESSE/workflow-builder/pull/161))
* Support for if/then/else in JSON schema ([#160](https://github.com/i-VRESSE/workflow-builder/pull/160))
* Pick any chain of the given molecules ([#162](https://github.com/i-VRESSE/workflow-builder/issues/162))

## @i-vresse/wb-core 3.0.1 - 2024-05-23

### Fixed

* Unexpected error on cancel molecule file upload.

## @i-vresse/wb-core 3.0.0 + @i-vresse/wb-form 2.0.0 - 2024-05-16

### Changed

* Autosave ([#144](https://github.com/i-VRESSE/workflow-builder/pull/144))
* Improved handling of groups in ui schema
* Nodes with all its properties in a single group is expanded by default

### Fixed

* Hide the exit module ([#153](https://github.com/i-VRESSE/workflow-builder/issues/153))

## @i-vresse/wb-core 2.0.1 - 2024-03-25

### Changed

* Upload errors are rendered on screen instead of console ([#143](https://github.com/i-VRESSE/workflow-builder/pull/143))

## @i-vresse/wb-core 1.1.4 - 2024-03-25

### Changed

* In table moved buttons from last to first column ([#141](https://github.com/i-VRESSE/workflow-builder/issues/141))

## @i-vresse/wb-core 2.0.0 - 2024-03-18

### Removed

* Removed CSS-in-JS styles from the core library.

### Changed

* The styles in the examples to compensate for the removed styles in the core (see App.css).

## @i-vresse/wb-form 1.1.3 - 2024-03-08

### Changed

* Start item number from 1 instead of 0

## @i-vresse/wb-core 1.2.3 - 2024-02-02

### Changed

* Export more workflow parsing and validation methods

## @i-vresse/wb-core 1.2.2 - 2024-01-25

### Added

* Ignore maxPropertiesFrom in catalog ([#132](https://github.com/i-VRESSE/workflow-builder/pull/132))

## @i-vresse/wb-core 1.2.1 - 2023-04-06

### Changed

* Handle bad pdb file better ([#129](https://github.com/i-VRESSE/workflow-builder/pull/129))

## @i-vresse/wb-core 1.2.0 - 2023-04-06

### Changed

* Allow to @i-vresse/wb-core/dist/toml.js to be imported in remix.

## @i-vresse/wb-core 1.1.3 - 2023-03-01

### Changed

* Show global parameters form on page load ([#123](https://github.com/i-VRESSE/workflow-builder/pull/123))

## @i-vresse/wb-core 1.1.2 - 2022-08-23

### Added

* Allow custom fields and widgets in form. ([#116](https://github.com/i-VRESSE/workflow-builder/pull/116))

## @i-vresse/wb-form 1.1.2 - 2022-08-12

### Added

* Missing React import ([#115](https://github.com/i-VRESSE/workflow-builder/pull/115))

## @i-vresse/wb-core 1.1.1 - 2022-08-10

Previous release did not contain code.

## @i-vresse/wb-form 1.1.1 - 2022-08-10

Previous release did not contain code.

## @i-vresse/wb-core 1.1.0 - 2022-08-10

### Added

* Molecule filename as index in array sub-forms ([#76](https://github.com/i-VRESSE/workflow-builder/issues/76))

## @i-vresse/wb-form 1.1.0 - 2022-08-10

### Added

* Molecule filename as index in array sub-forms ([#76](https://github.com/i-VRESSE/workflow-builder/issues/76))

## 1.0.0 - 2022-08-02

Initial release

<!-- 
To record change to a package use a custom header like 

## @i-vresse/wb-form 1.0.1 - 2022-08-02

... Changes of form package ...

-->