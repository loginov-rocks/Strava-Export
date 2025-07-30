# API Code

Writing down considerations around code and architecture to easier contribution (from LLMs mostly).

Imports:

* First comes the package imports.
* Then after a new line imports not from the same directory.
* Then after a new line imports from the same directory.
* All imports should be sorted alphabetically.
* All imported entities should be sorted alphabetically.

Constants:

* All constants should be set in the `constants.ts`.
* Constants can be imported only at the root level files, such as `app.ts`, `container.ts`, etc.
* If a controller or service needs a constant, it should be injected in `container.ts`.
* BASE_URLs injected only in Controllers/Middlewares, not Services, since it's HTTP concern.

Entry points:

* There are three entry points into 3 different applications: `app.ts`, `mcp.ts`, `workers.ts`.
* All three are sharing the same codebase and run from the same container with different start commands.

Routes:

* All routes should be configured in the corresponding modules, with no implementation, the responsibility is configuring the endpoints with mix and match middlewares.

Mongo & Redis:

* Should be instantiated in the correponding modules, and injected as dependencies in the main files (root level: `app.ts`, `mcp.ts`, etc).

Container:

* Serves to inject dependencies, exports controllers and middlewares used by routes and workers.

Models:

* Implement indexes by the query fields, but not sorting (at least for now) for separation of concerns since sorting is at the application level/requirements, not the database schema itself.
 
Repositories:

* Should be an abstraction layer from the underlying storage mechanism, so require refactoring to provide flat objects instead of Active Record pattern provided by Mongoose.

Exports:

* Exported interfaces go first, then non-exported.

Overall Architecture

This is a Node.js/TypeScript Express API for a Strava-focused application called "Stravaholics" that provides:

- Web authentication via Strava OAuth
- OAuth2 authorization server capabilities
- Personal Access Token (PAT) management
- Activity data synchronization from Strava
- Model Context Protocol (MCP) server integration

Key Architectural Patterns

Dependency Injection Container (src/container.ts:1): Central IoC container that wires up all dependencies - repositories, services, controllers, and middlewares.

Layered Architecture:

- Controllers → Handle HTTP requests/responses
- Services → Business logic layer
- Repositories → Data access layer with BaseRepository pattern (src/repositories/BaseRepository.ts:5)
- Models → Mongoose schemas with UUID-based BaseModel (src/models/BaseModel.ts:13)

Core Components

Multiple Entry Points:

- src/app.ts:1 - Main API server (port 3001)
- src/mcp.ts:1 - MCP protocol server (port 3002)
- src/workers.ts - Background job workers

Authentication System:

- WebAuth - Cookie-based auth for web app users
- OAuth - Standard OAuth2 server for third-party (MCP) clients
- PAT - Personal Access Tokens for API access
- Composite middleware allows multiple auth methods (src/appRouter.ts:41)

Data Models (UUID-based):

- User, Activity, SyncJob, PAT
- OAuth entities (Client, Code, State)
- All extend BaseModel with timestamps

External Integrations:

- Strava API Client for fetching user activities
- BullMQ for background job processing
- MongoDB with Mongoose ODM
- Redis for job queues

Key Services:

- UserService - User operations with encryption
- ActivitySyncService - Strava data synchronization
- TokenService - JWT token management
- WebAuthService - Web authentication flow
