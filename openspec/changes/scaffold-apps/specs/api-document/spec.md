## ADDED Requirements

### Requirement: PDF rendering via Gotenberg HTTP API
The system SHALL render CV and cover letter PDFs by sending HTTP POST requests to a Gotenberg sidecar service at the URL configured by `GOTENBERG_URL`. The endpoint used SHALL be `/forms/chromium/convert/html`. The request SHALL be multipart/form-data with an `index.html` file containing the rendered HTML+CSS. The response body is the PDF binary.

#### Scenario: CV PDF generated via Gotenberg
- **WHEN** the document processor renders a CV
- **THEN** an HTTP POST is made to `$GOTENBERG_URL/forms/chromium/convert/html` with the CV HTML and the response binary is used as the PDF buffer

#### Scenario: Cover letter PDF generated via Gotenberg
- **WHEN** the document processor renders a cover letter
- **THEN** an HTTP POST is made to Gotenberg with the cover letter HTML and the response binary is used as the PDF buffer

#### Scenario: Gotenberg unavailable
- **WHEN** the Gotenberg service is unreachable
- **THEN** the document processor job fails and Bull retries it according to the retry policy

### Requirement: No Puppeteer dependency
The `apps/api` package SHALL NOT depend on `puppeteer`, `puppeteer-core`, or any Chromium binary. PDF rendering is fully delegated to the Gotenberg sidecar.

#### Scenario: API image has no Chromium
- **WHEN** the API Docker image is built
- **THEN** no Chromium or Puppeteer binaries are present in the image

### Requirement: HTML templates
The system SHALL use HTML/CSS templates located at `apps/api/src/document/templates/`. Templates SHALL produce clean, professional output. The `DocumentService` SHALL render each template to an HTML string (interpolating CV/cover letter data) before POSTing to Gotenberg.

#### Scenario: Templates rendered to string and posted
- **WHEN** the document processor runs
- **THEN** the CV template is rendered to HTML and POSTed to Gotenberg, and the cover letter template is rendered and POSTed separately

### Requirement: Enqueue to notification queue after rendering
Upon successful rendering of both PDFs, the system SHALL enqueue the `JobApplication` ID and both PDF buffers to the `notification` queue.

#### Scenario: Notification queue enqueued after rendering
- **WHEN** both PDFs are rendered successfully
- **THEN** the JobApplication ID and PDF buffers are added to the notification queue
