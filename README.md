# Ilios Frontend

## Web interface for accessing and managing [Ilios Platform](https://github.com/ilios/ilios) data

![Continuous Integration](https://github.com/ilios/frontend/workflows/Continuous%20Integration/badge.svg)
[![Netlify Status](https://api.netlify.com/api/v1/badges/348f5759-eda7-4f3d-b8a7-1b1189e63583/deploy-status)](https://app.netlify.com/sites/ilios-frontend/deploys)

## Open Source Heroes

Every day these for-profit companies make developing Ilios possible. Without the free tier of service they offer to
open source software, ilios would be nowhere, so if you have a chance to pay them for something please do.

- [GitHub](https://github.com)
- [Sentry](https://sentry.io/for/open-source/)
- [Netlify](https://www.netlify.com)

## Reporting Issue

All Ilios issues should be reported to our [common issue tracker](https://github.com/ilios/ilios/issues)

## Directions for developers working with this ember-cli app

### Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [PNPM](https://pnpm.io)
- [Ember CLI](https://cli.emberjs.com/release/)

### Installation

- `git clone git@github.com:ilios/frontend.git`
- `cd frontend`
- `pnpm install`

### Running / Development

This Frontend will need to know where your backend API server is located.
You can set this information in a system wide environment variable name ILIOS_FRONTEND_API_HOST
or you can add it to the CLI when you start the server.

- `ILIOS_FRONTEND_API_HOST=https://demo.iliosproject.org pnpm start`
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

- `pnpm test`
- `pnpm test --server`

### Linting

- `pnpm run lint:hbs`
- `pnpm run lint:css`
- `pnpm run lint:js`
- `pnpm run lint:js --fix`

### Building

- `pnpm --filter frontend exec ember build` (development)
- `pnpm --filter frontend exec ember build --environment production` (production)

## Further Reading / Useful Links

- [ember.js](https://emberjs.com/)
- [ember-cli](https://cli.emberjs.com/release/)
- [Ilios User Guide](https://www.gitbook.com/book/iliosproject/ilios-user-guide/details)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
