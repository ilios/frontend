# Ilios Frontend
## Web interface for accessing and managing [Ilios Platform](https://github.com/ilios/ilios) data.

![Continuous Integration](https://github.com/ilios/frontend/workflows/Continuous%20Integration/badge.svg)
[![Code Climate](https://codeclimate.com/github/ilios/frontend/badges/gpa.svg)](https://codeclimate.com/github/ilios/frontend)
[![Test Coverage](https://codeclimate.com/github/ilios/frontend/badges/coverage.svg)](https://codeclimate.com/github/ilios/frontend/coverage)
[![Netlify Status](https://api.netlify.com/api/v1/badges/348f5759-eda7-4f3d-b8a7-1b1189e63583/deploy-status)](https://app.netlify.com/sites/ilios-frontend/deploys)

## Open Source Heroes

Every day these for-profit companies make developing Ilios possible.  Without the free tier of service they offer to
open source software, ilios would be nowhere, so if you have a chance to pay them for something please do.

- [GitHub](https://github.com)
- [Sentry](https://sentry.io/for/open-source/)
- [Netlify](https://www.netlify.com)
- [BrowserStack](https://www.browserstack.com)

## Reporting Issue

All Ilios issues should be reported to our [common issue tracker](https://github.com/ilios/ilios/issues)

## Directions for developers working with this ember-cli app

### Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://cli.emberjs.com/release/)

### Installation

* `git clone git@github.com:ilios/frontend.git`
* `cd frontend`
* `npm install`

### Running / Development

This Frontend will need to know where your backend API server is located. 
You can set this information in a system wide environment variable name ILIOS_FRONTEND_API_HOST 
or can just add the setting to a file named .env file 
within the same directory as your Ilios Frontend code:

* `echo "ILIOS_FRONTEND_API_HOST=https://ilios3-demo.ucsf.edu" > .env`

Then you can start a local development server:

* `npm start`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `npm test`
* `npm test --server`

### Linting

* `npm run lint:hbs`
* `npm run lint:style`
* `npm run lint:js`
* `npm run lint:js --fix`

### Building

* `npm build` (development)
* `npm build --environment production` (production)

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://cli.emberjs.com/release/)
* [Ilios User Guide](https://www.gitbook.com/book/iliosproject/ilios-user-guide/details)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
