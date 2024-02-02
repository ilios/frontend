# How To Contribute

## Installation

* `git clone <repository-url>`
* `cd my-addon`
* `pnpm install`

## Linting

* `pnpm run lint`
* `pnpm run lint:fix`

## Running tests

* `pnpm test` – Runs the test suite on the current Ember version

## Running the test application

* `pnpm start`
* Visit the test application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://cli.emberjs.com/release/](https://cli.emberjs.com/release/).


### Point Common at the API Server

To view the application with data you'll need to provide a URL to a running API server. You can use
docker to create a local server following the [Quick Setup Guide](https://github.com/ilios/ilios/blob/master/docs/ilios_quick_setup_for_admins.md) for Ilios or point to an existing API server. 

Pass that information to the application using the `ILIOS_FRONTEND_API_HOST` environmental variable.

```bash
ILIOS_FRONTEND_API_HOST=https://demo.iliosproject.org pnpm start
```
