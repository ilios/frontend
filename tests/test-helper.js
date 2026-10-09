import '@warp-drive/ember/install'; // must be first in this file
import Application from 'frontend/app';
import config from 'frontend/config/environment';
import * as QUnit from 'qunit';
import { stopMSW } from 'frontend/tests/msw';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';

import DefaultAdapter from 'ember-cli-page-object/adapters/rfc268';
import { setAdapter } from 'ember-cli-page-object/adapters';
import {
  setRunOptions,
  setupGlobalA11yHooks,
  setupQUnitA11yAuditToggle,
  setupConsoleLogger,
} from 'ember-a11y-testing/test-support';

import { start as startEmberExam } from 'ember-exam/addon-test-support';

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
