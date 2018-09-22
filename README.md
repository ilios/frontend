# Ilios Frontend
## Web interface for accessing and managing [Ilios Platform](https://github.com/ilios/ilios) data.

[![Greenkeeper badge](https://badges.greenkeeper.io/ilios/frontend.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/ilios/frontend.svg?branch=master)](https://travis-ci.org/ilios/frontend)
[![Code Climate](https://codeclimate.com/github/ilios/frontend/badges/gpa.svg)](https://codeclimate.com/github/ilios/frontend)
[![Test Coverage](https://codeclimate.com/github/ilios/frontend/badges/coverage.svg)](https://codeclimate.com/github/ilios/frontend/coverage)
[![Slack](https://ilios-slack.herokuapp.com/badge.svg)](https://ilios-slack.herokuapp.com/)
[![Stories in Ready](https://badge.waffle.io/ilios/frontend.png?label=ready&title=Ready)](https://waffle.io/ilios/frontend)

## Open Source Heroes

Every day these for-profit companies make developing Ilios possible.  Without the free tier of service they offer to
open source software, ilios would be nowhere, so if you have a chance to pay them for something please do.

- [GitHub](https://github.com)
- [Travis CI](https://travis-ci.org/)  
- [Sauce Labs](https://saucelabs.com/)
- [Heroku](https://www.heroku.com)
- [Netlify](https://www.netlify.com)
- [BrowserStack](https://www.browserstack.com)

## Directions for developers working with this ember-cli app

### Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Yarn](https://yarnpkg.com/)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

### Installation

* `git clone git@github.com:ilios/frontend.git`
* `cd frontend`
* `yarn install`

### Running / Development

This Frontend will need to know where your backend API server is located. 
You can set this information in a system wide environment variable name ILIOS_FRONTEND_API_HOST 
or can just add the setting to a file named .env file 
within the same directory as your Ilios Frontend code:

* `echo "ILIOS_FRONTEND_API_HOST=https://ilios3-demo.ucsf.edu" > .env`

Then you can start a local development server:

* `yarn start`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `yarn test`
* `yarn test --server`

### Linting

* `yarn lint:hbs`
* `yarn lint:style`
* `yarn lint:js`
* `yarn lint:js --fix`

### Building

* `yarn build` (development)
* `yarn build --environment production` (production)

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* [Ilios User Guide](https://www.gitbook.com/book/iliosproject/ilios-user-guide/details)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
