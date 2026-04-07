## Purpose

CRUD management of the structured CV profile and all its sub-entities, scoped to the authenticated user.

## Requirements

### Requirement: CvProfile CRUD scoped to authenticated user
The system SHALL expose JSON:API endpoints for creating, reading, updating, and deleting the `CvProfile` associated with the authenticated user. All reads and writes SHALL be scoped to the authenticated user's `userId`. A user SHALL NOT be able to read or modify another user's CvProfile.

#### Scenario: Get CV profile
- **WHEN** a GET request is made to `/cv-profiles`
- **THEN** only the CvProfile belonging to the authenticated user is returned

#### Scenario: Update CV profile summary
- **WHEN** a PATCH request is made to `/cv-profiles/:id` with an updated summary
- **THEN** the CvProfile summary is updated and the response reflects the change

#### Scenario: Cross-user access rejected
- **WHEN** a user makes a PATCH request to `/cv-profiles/:id` belonging to a different user
- **THEN** HTTP 404 is returned

### Requirement: Sub-entities scoped to authenticated user
All WorkExperience, Education, Skill, Language, Certification, and Project CRUD operations SHALL verify the parent CvProfile belongs to the authenticated user before proceeding. Cross-user mutations SHALL return HTTP 404.

#### Scenario: Delete another user's work experience rejected
- **WHEN** a user attempts to delete a WorkExperience belonging to another user's CvProfile
- **THEN** HTTP 404 is returned

### Requirement: WorkExperience CRUD
The system SHALL expose JSON:API endpoints for managing `WorkExperience` records linked to the CvProfile.

#### Scenario: Add work experience
- **WHEN** a POST request is made to `/work-experiences` with company, role, startDate, and description
- **THEN** a new WorkExperience record is created and linked to the CvProfile

#### Scenario: Delete work experience
- **WHEN** a DELETE request is made to `/work-experiences/:id`
- **THEN** the WorkExperience record is removed

### Requirement: Education CRUD
The system SHALL expose JSON:API endpoints for managing `Education` records linked to the CvProfile.

#### Scenario: Add education
- **WHEN** a POST request is made to `/educations` with institution, degree, field, and startDate
- **THEN** a new Education record is created and linked to the CvProfile

### Requirement: Skill CRUD
The system SHALL expose JSON:API endpoints for managing `Skill` records linked to the CvProfile.

#### Scenario: Add skill
- **WHEN** a POST request is made to `/skills` with name and category
- **THEN** a new Skill record is created and linked to the CvProfile

### Requirement: Language CRUD
The system SHALL expose JSON:API endpoints for managing `Language` records linked to the CvProfile.

#### Scenario: Add language
- **WHEN** a POST request is made to `/languages` with language and proficiency
- **THEN** a new Language record is created and linked to the CvProfile

### Requirement: Certification CRUD
The system SHALL expose JSON:API endpoints for managing `Certification` records linked to the CvProfile.

#### Scenario: Add certification
- **WHEN** a POST request is made to `/certifications` with name, issuer, and date
- **THEN** a new Certification record is created and linked to the CvProfile

### Requirement: Project CRUD
The system SHALL expose JSON:API endpoints for managing `Project` records linked to the CvProfile.

#### Scenario: Add project
- **WHEN** a POST request is made to `/projects` with name and description
- **THEN** a new Project record is created and linked to the CvProfile
