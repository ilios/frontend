import Application from 'lti-dashboard/app';
import config from 'lti-dashboard/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import start from 'ember-exam/test-support/start';
import DefaultAdapter from 'ember-cli-page-object/adapters/rfc268';
import { setAdapter } from 'ember-cli-page-object/adapters';
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

setAdapter(new DefaultAdapter());
setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
