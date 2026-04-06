## ADDED Requirements

### Requirement: SWC compiler via nest-cli.json builder
The NestJS app SHALL configure `builder: "swc"` in `nest-cli.json` so that `nest build` and `nest start` use SWC instead of `tsc`. The project SHALL include a `.swcrc` with `experimentalDecorators: true` and `emitDecoratorMetadata: true`.

#### Scenario: Build uses SWC
- **WHEN** `nest build` is run
- **THEN** the build completes using SWC (no `tsc` invocation) and outputs to `dist/`

#### Scenario: Dev server uses SWC
- **WHEN** `nest start --watch` is run
- **THEN** file changes trigger SWC recompilation, not tsc

### Requirement: SWC dev dependencies
The `apps/api/package.json` SHALL include `@swc/cli` and `@swc/core` as dev dependencies.

#### Scenario: Dependencies present
- **WHEN** `yarn install` completes
- **THEN** `@swc/cli` and `@swc/core` are available in the API workspace
