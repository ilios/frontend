import * as Sentry from '@sentry/browser';
import { Ember } from '@sentry/integrations/esm/ember';
import { versionRegExp } from 'ember-cli-app-version/utils/regexp';

function startSentry(config) {
  const captureErrors = isErrorCaptureEnabled(config);
  Sentry.init({
    ...config.sentry,
    integrations: [new Ember()],
    release: config.APP.version.match(versionRegExp)[0],
    beforeSend(event) {
      if (!captureErrors) {
        return null;
      }

      return event;
    },
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
  const tag = document ?  document.querySelector(`head meta[name=${prefix}-${varName}]`) : null;
  const content = tag ? tag.content : serverVariables.defaults[varName];
  return JSON.parse(content);
}

export {
  startSentry,
};
