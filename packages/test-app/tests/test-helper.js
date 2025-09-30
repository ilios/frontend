import '@warp-drive/ember/install'; // must be first in this file

import Application from 'test-app/app';
import config from 'test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation } from 'ember-qunit';

import {
  setRunOptions,
  setupGlobalA11yHooks,
  setupQUnitA11yAuditToggle,
  setupConsoleLogger,
} from 'ember-a11y-testing/test-support';

import start from 'ember-exam/test-support/start';

setupConsoleLogger();
setRunOptions({
  preload: false,
});
setupGlobalA11yHooks(() => true);
setupQUnitA11yAuditToggle(QUnit);

setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();
start();
