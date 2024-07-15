import Application from 'frontend/app';
import config from 'frontend/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import start from 'ember-exam/test-support/start';
import DefaultAdapter from 'ember-cli-page-object/adapters/rfc268';
import { setAdapter } from 'ember-cli-page-object/adapters';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import 'qunit-theme-ember/qunit.css';
import './helpers/flash-message';
import './helpers/percy-snapshot-name';

setRunOptions({
  preload: false,
});

setAdapter(new DefaultAdapter());
setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
