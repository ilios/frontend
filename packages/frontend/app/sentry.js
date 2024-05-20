import * as Sentry from '@sentry/ember';
import { versionRegExp } from 'ember-cli-app-version/utils/regexp';

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

  const { modulePrefix, serverVariables } = config;
  const prefix = serverVariables.tagPrefix || modulePrefix;

  const errorCaptureValue = document
    ? document.querySelector(`head meta[name=${prefix}-${errorCaptureName}]`)
    : null;
  const errorCaptureContent = errorCaptureValue
    ? errorCaptureValue.content
    : serverVariables.defaults[errorCaptureName];

  const errorEnvironmentValue = document
    ? document.querySelector(`head meta[name=${prefix}-${errorEnvironmentName}]`)
    : null;
  const errorEnvironmentContent = errorEnvironmentValue
    ? errorEnvironmentValue.content
    : serverVariables.defaults[errorEnvironmentName];

  return [
    JSON.parse(errorCaptureContent),
    errorEnvironmentContent?.length ? errorEnvironmentContent : null,
  ];
}

export { startSentry };
