# Contribution

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

Entry points:

* There are three entry points into 3 different applications: `app.ts`, `mcp.ts`, `workers.ts`.
* All three are sharing the same codebase and run from the same container with different start commands.

Routes:

* All routes should be configured in the corresponding modules, with no implementation, the responsibility is configuring the endpoints with mix and match middlewares.

Mongo & Redis:

* Should be instantiated in the correponding modules, and injected as dependencies in the main files (root level: `app.ts`, `mcp.ts`, etc).

Container:

* Serves to inject dependencies, exports controllers and middlewares used by routes and workers.
