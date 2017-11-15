# Ilios Frontend

[![Greenkeeper badge](https://badges.greenkeeper.io/ilios/frontend.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/ilios/frontend.svg?branch=master)](https://travis-ci.org/ilios/frontend)
[![Code Climate](https://codeclimate.com/github/ilios/frontend/badges/gpa.svg)](https://codeclimate.com/github/ilios/frontend)
[![Test Coverage](https://codeclimate.com/github/ilios/frontend/badges/coverage.svg)](https://codeclimate.com/github/ilios/frontend/coverage)
[![Slack](https://ilios-slack.herokuapp.com/badge.svg)](https://ilios-slack.herokuapp.com/)
[![Stories in Ready](https://badge.waffle.io/ilios/frontend.png?label=ready&title=Ready)](https://waffle.io/ilios/frontend)

## Web interface for accessing and managing [Ilios Platform](https://github.com/ilios/ilios) data.

### Directions for developers working with this ember-cli app

#### Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)

We recommend installing Node.js though [NVM](https://github.com/creationix/nvm#installation)

#### Installation

* `git clone git@github.com:ilios/frontend.git`
* change into the new directory `cd frontend`
* `npm install`

#### Connection to the demo API server

The Frontend needs to know where your API server is located.  You can set this information in a system wide
environmental variable or just create a `.env` file in your code directory.
* `echo "ILIOS_FRONTEND_API_HOST=https://ilios3-demo.ucsf.edu" > .env`

#### Running / Development

* `ember serve`
* Visit your app at http://localhost:4200

#### Running Tests

* `ember test`
* `ember test --server`

#### Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* [Ilios User Guide](https://www.gitbook.com/book/iliosproject/ilios-user-guide/details)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

## Open Source Heroes

Every day these for profit companies make developing Ilios possible.  Without the free tier of service they offer to
open source software we would be nowhere so if you have a chance to pay them for something please do.

- [GitHub](https://github.com)
- [Travis CI](https://travis-ci.org/)  
- [Sauce Labs](https://saucelabs.com/)
- [Heroku](https://www.heroku.com)
- [Netlify](https://www.netlify.com)
- [BrowserStack](https://www.browserstack.com)
