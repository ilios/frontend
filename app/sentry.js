import * as Sentry from '@sentry/ember';
import { versionRegExp } from 'ember-cli-app-version/utils/regexp';

function startSentry(config) {
  const captureErrors = isErrorCaptureEnabled(config);
  const DSN = config.sentry.dsn;

  Sentry.init({
    dsn: captureErrors ? DSN : null,
    environment: config.environment,
    release: config.APP.version.match(versionRegExp)[0],
    tracesSampleRate: 0.25,
  });
}

/**
 * Duplicate the functionality of ember-cli-server-variables since
 * we can't load a service here in the pre-boot setup
 */
function isErrorCaptureEnabled(config) {
  const varName = 'error-capture-enabled';
  const { modulePrefix, serverVariables } = config;
  const prefix = serverVariables.tagPrefix || modulePrefix;
  const tag = document ? document.querySelector(`head meta[name=${prefix}-${varName}]`) : null;
  const content = tag ? tag.content : serverVariables.defaults[varName];
  return JSON.parse(content);
}

export { startSentry };
