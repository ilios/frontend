import Application from 'lti-course-manager/app';
import config from 'lti-course-manager/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { loadTests } from 'ember-qunit/test-loader';
import { setupEmberOnerrorValidation } from 'ember-qunit';

import start from 'ember-exam/test-support/start';
import 'qunit-theme-ember/qunit.css';
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';

//Needed for: https://github.com/testem/testem/issues/1577
//See: https://github.com/ember-cli-code-coverage/ember-cli-code-coverage/issues/420
if (typeof Testem !== 'undefined') {
  //eslint-disable-next-line no-undef
  Testem?.afterTests(function (config, data, callback) {
    forceModulesToBeLoaded();
    sendCoverage(callback);
  });
} else if (typeof QUnit !== 'undefined') {
  //eslint-disable-next-line no-undef
  QUnit.done(async function () {
    forceModulesToBeLoaded();
    await sendCoverage();
  });
}
setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();
loadTests();
start();
