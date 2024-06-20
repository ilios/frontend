# LTI Dashboard

Learning Tools Interoperability (LTI) application for the Ilios dashboard.

## Directions for developers working with this ember-cli app

### Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [PNPM](https://pnpm.io)
- [Ember CLI](https://cli.emberjs.com/release/)
- [Google Chrome](https://google.com/chrome/)

### Installation

- `git clone git@github.com:ilios/frontend.git`
- `cd frontend`
- `pnpm install`

### Running / Development

- `ILIOS_FRONTEND_API_HOST=https://ilios3-demo.ucsf.edu pnpm start:lti-dashboard`
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

#### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

- `pnpm test:lti-dashboard`
- `pnpm test:lti-dashboard --server`

### Linting

- `pnpm lint`
- `pnpm lint:fix`

### Building

- `pnpm --filter lti-dashboard exec ember build` (development)
- `pnpm --filter lti-dashboard exec ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

### Further Reading / Useful Links

- [ember.js](https://emberjs.com/)
- [ember-cli](https://cli.emberjs.com/release/)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
