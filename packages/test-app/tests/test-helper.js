import Application from 'test-app/app';
import config from 'test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation } from 'ember-qunit';

import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';
import {
  setupGlobalA11yHooks,
  setupQUnitA11yAuditToggle,
  setupConsoleLogger,
} from 'ember-a11y-testing/test-support';

import start from 'ember-exam/test-support/start';

setupConsoleLogger();
setupGlobalA11yHooks(() => true);
setupQUnitA11yAuditToggle(QUnit);

//Needed for: https://github.com/testem/testem/issues/1577
//See: https://github.com/ember-cli-code-coverage/ember-cli-code-coverage/issues/420
if (typeof Testem !== 'undefined') {
  //eslint-disable-next-line no-undef
  Testem?.afterTests(function (config, data, callback) {
    forceModulesToBeLoaded();
    sendCoverage(callback);
  });
} else if (typeof QUnit !== 'undefined') {
  QUnit.done(async function () {
    forceModulesToBeLoaded();
    await sendCoverage();
  });
}

setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();
start();
