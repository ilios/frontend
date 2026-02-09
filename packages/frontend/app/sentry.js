import * as Sentry from '@sentry/ember';
import { versionRegExp } from 'ember-cli-app-version/utils/regexp';
import { getValueFromHtml } from 'ilios-common/utils/html-server-variables';

function startSentry(config) {
  const [captureErrors, environment] = errorCaptureConfig(config);
  const DSN = config.sentry.dsn;

  Sentry.init({
    dsn: captureErrors ? DSN : null,
    environment,
    release: `v${config.APP.version.match(versionRegExp)[0]}`,
    tracesSampleRate: 0.25,
  });
}

/**
 * Duplicate the functionality of ember-cli-server-variables since
 * we can't load a service here in the pre-boot setup
 */
function errorCaptureConfig(config) {
  const errorCaptureName = 'error-capture-enabled';
  const errorEnvironmentName = 'error-capture-environment';

  const errorCaptureValue =
    getValueFromHtml(errorCaptureName) ?? config.environment === 'production';
  const errorEnvironmentValue = getValueFromHtml(errorEnvironmentName) ?? config.environment;

  return [
    JSON.parse(errorCaptureValue),
    errorEnvironmentValue.length ? errorEnvironmentValue : null,
  ];
}

export { startSentry };
