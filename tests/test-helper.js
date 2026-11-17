import '@warp-drive/ember/install'; // must be first in this file

import { setApplication } from '@ember/test-helpers';
import {
  setRunOptions,
  setupConsoleLogger,
  setupGlobalA11yHooks,
  setupQUnitA11yAuditToggle,
} from 'ember-a11y-testing/test-support';
import { setAdapter } from 'ember-cli-page-object/adapters';
import DefaultAdapter from 'ember-cli-page-object/adapters/rfc268';
import { start as startEmberExam } from 'ember-exam/addon-test-support';
import Application from 'frontend/app';
import config from 'frontend/config/environment';
import { stopMSW } from 'frontend/tests/msw';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

export async function start(options) {
  QUnit.done(async () => {
    await stopMSW();
  });
  setupConsoleLogger();
  setRunOptions({
    preload: false,
  });
  setupGlobalA11yHooks(() => true);
  setupQUnitA11yAuditToggle(QUnit);

  setAdapter(new DefaultAdapter());
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);

  // Options passed to `start` will be passed-through to ember-qunit
  await startEmberExam(options);
}
