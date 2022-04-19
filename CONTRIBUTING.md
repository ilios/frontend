# How To Contribute

## Installation

* `git clone <repository-url>`
* `cd my-addon`
* `npm install`

## Linting

* `npm run lint`
* `npm run lint:fix`

## Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

## Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://cli.emberjs.com/release/](https://cli.emberjs.com/release/).

## Running an API server for development Using Docker and Docker Compose

For the fastest way to get up and running with Ilios for your development purposes, we HIGHLY recommend using Docker and Docker Compose.

### Install Docker

You will need Docker and Docker compose:

- [OS X](https://www.docker.com/docker-mac)
- [Windows](https://www.docker.com/docker-windows)
- [Ubuntu](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/)

### Running a local development server

```bash
$ docker-compose pull
$ docker-compose up -d
```

### Accessing Ilios

You should now be able to access your newly-Dockerized instance of Ilios 
by visiting [http://localhost:8000](http://localhost:8000) in your browser.

### Shutting down the development server

From your ILIOS_CODE directory run:

```bash
$ docker-compose stop
```

### Point Common at the API Server

1. Create a `.env` file in the source code directory
2. Add `ILIOS_FRONTEND_API_HOST=http://localhost:8000` on it's own line to the `.env` file
