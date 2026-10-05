import * as Sentry from '@sentry/ember';
import { getValueFromHtml } from './utils/html-server-variables';

function startSentry(config) {
  const [captureErrors, environment] = errorCaptureConfig(config);
  const dsn = 'https://ded7a44cf4084601a2fb468484bbe3ed@sentry.io/1311608';

  Sentry.init({
    dsn: captureErrors ? dsn : null,
    environment,
    release: `v${config.APP.VERSION}`,
    tracesSampleRate: 0.25,
  });
}

/**
 * Duplicate the functionality of ember-cli-server-variables since
 * we can't load a service here in the pre-boot setup
 */
function errorCaptureConfig(config) {
  const errorCaptureValue = getValueFromHtml('error-capture-enabled') ?? config.errorCaptureEnabled;
  const errorEnvironmentValue =
    getValueFromHtml('error-capture-environment') ?? config.errorCaptureEnvironment;

  return [
    JSON.parse(errorCaptureValue),
    errorEnvironmentValue.length ? errorEnvironmentValue : null,
  ];
}

export { startSentry };
