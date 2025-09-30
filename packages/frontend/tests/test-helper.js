import '@warp-drive/ember/install'; // must be first in this file

import Application from 'frontend/app';
import config from 'frontend/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation } from 'ember-qunit';

import DefaultAdapter from 'ember-cli-page-object/adapters/rfc268';
import { setAdapter } from 'ember-cli-page-object/adapters';
import {
  setRunOptions,
  setupGlobalA11yHooks,
  setupQUnitA11yAuditToggle,
  setupConsoleLogger,
} from 'ember-a11y-testing/test-support';

import start from 'ember-exam/test-support/start';
import './helpers/percy-snapshot-name';

setupConsoleLogger();
setRunOptions({
  preload: false,
});
setupGlobalA11yHooks(() => true);
setupQUnitA11yAuditToggle(QUnit);

setAdapter(new DefaultAdapter());
setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();
start();
