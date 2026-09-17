# How To Contribute

## Contributor Accountability

Whether AI-generated or poorly crafted by a human contributor, verbose, over-engineered, or superficially-correct code places a disproportionate review burden on maintainers. Disclosure creates accountability, and helps ensure contributors take ownership of any AI-assisted work. Contributors are expected to:

- Thoroughly review and understand every line of code before submission
- Refine all code whether AI output or human-written to meet project quality standards
- Take **full ownership** of all submitted content regardless of origin
- Disclose when AI has been used in (or as assistance for) code generation

Low-effort submissions or submissions without clearly identified human ownership will be rejected without detailed feedback until properly refined. This applies to all contributions, but is particularly relevant for AI-assisted work.

## Installation

- `git clone <repository-url>`
- `cd my-addon`
- `pnpm install`

## Linting

- `pnpm run lint`
- `pnpm run lint:fix`

## Running tests

- `pnpm test` – Runs the test suite on the current Ember version

## Running the test application

- `pnpm start`
- Visit the test application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://cli.emberjs.com/release/](https://cli.emberjs.com/release/).

### Connecting to an API server

To view the application with data you'll need to provide a URL to a running API server. You can use docker to create a local server following the [Quick Setup Guide](https://github.com/ilios/ilios/blob/master/docs/ilios_quick_setup_for_admins.md) for Ilios or point to an existing API server, such as https://demo.iliosproject.org.

Pass that information to the application using the `ILIOS_FRONTEND_API_HOST` environmental variable.

```bash
ILIOS_FRONTEND_API_HOST=https://demo.iliosproject.org pnpm start
```

Find more information, including information on obtaining access credentials,
on the [demo](https://demo.iliosproject.org) environment on
the [project website](https://www.iliosproject.org/demo/)
