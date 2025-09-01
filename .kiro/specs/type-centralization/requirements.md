# Requirements Document

## Introduction

The current codebase has type definitions scattered across multiple files and directories, leading to duplication, inconsistency, and maintenance challenges. This feature aims to centralize all TypeScript type definitions in the `/types` folder to improve code organization, reduce duplication, eliminate circular dependencies, and enhance developer experience.

## Requirements

### Requirement 1

**User Story:** As a developer, I want all TypeScript types centralized in the `/types` folder, so that I can easily find and maintain type definitions without searching through multiple component files.

#### Acceptance Criteria

1. WHEN I need to find a type definition THEN I SHALL look in the `/types` folder first
2. WHEN I create a new type THEN I SHALL place it in the appropriate file within `/types` folder
3. WHEN I import a type THEN I SHALL import it from the `/types` folder, not from component files

### Requirement 2

**User Story:** As a developer, I want duplicate type definitions eliminated, so that I maintain consistency and avoid conflicting type definitions across the codebase.

#### Acceptance Criteria

1. WHEN there are multiple definitions of the same type THEN the system SHALL have only one canonical definition in `/types`
2. WHEN I update a type definition THEN I SHALL only need to update it in one location
3. WHEN types have similar purposes THEN they SHALL be consolidated into a single, comprehensive type definition

### Requirement 3

**User Story:** As a developer, I want types organized by domain/feature, so that I can quickly locate related type definitions and understand the system's data structures.

#### Acceptance Criteria

1. WHEN types belong to the same domain THEN they SHALL be grouped in the same file (e.g., `campaign.ts`, `domain.ts`)
2. WHEN I need types for a specific feature THEN I SHALL find them in a clearly named file within `/types`
3. WHEN types are shared across multiple domains THEN they SHALL be placed in a `common.ts` or `shared.ts` file

### Requirement 4

**User Story:** As a developer, I want consistent export patterns for types, so that I can import them predictably and maintain clean import statements.

#### Acceptance Criteria

1. WHEN exporting types THEN the system SHALL use named exports consistently
2. WHEN types have associated constants or enums THEN they SHALL be exported together from the same file
3. WHEN importing types THEN I SHALL be able to use barrel exports from the `/types` folder

### Requirement 5

**User Story:** As a developer, I want all component prop interfaces moved to the centralized types, so that components remain focused on presentation logic rather than type definitions.

#### Acceptance Criteria

1. WHEN a component has prop interfaces THEN they SHALL be moved to appropriate type files
2. WHEN prop interfaces are domain-specific THEN they SHALL be placed in the corresponding domain type file
3. WHEN prop interfaces are generic UI components THEN they SHALL be placed in a `ui.ts` or `components.ts` type file

### Requirement 6

**User Story:** As a developer, I want form validation schemas and their inferred types centralized, so that I can maintain consistency between validation and type checking.

#### Acceptance Criteria

1. WHEN using Zod schemas THEN the schemas SHALL be defined in `/types` alongside their inferred types
2. WHEN form types are needed THEN they SHALL be exported from the centralized type files
3. WHEN validation schemas change THEN the corresponding TypeScript types SHALL automatically reflect the changes

### Requirement 7

**User Story:** As a developer, I want circular dependency issues resolved, so that the build process is reliable and import statements work correctly.

#### Acceptance Criteria

1. WHEN types reference each other THEN there SHALL be no circular import dependencies
2. WHEN building the application THEN there SHALL be no TypeScript compilation errors related to circular dependencies
3. WHEN importing types THEN the import resolution SHALL be fast and reliable

### Requirement 8

**User Story:** As a developer, I want a clear migration path for existing code, so that I can update imports systematically without breaking the application.

#### Acceptance Criteria

1. WHEN migrating existing types THEN there SHALL be a clear mapping from old locations to new locations
2. WHEN updating imports THEN the changes SHALL be made incrementally to avoid breaking changes
3. WHEN the migration is complete THEN all old type definition files SHALL be removed
