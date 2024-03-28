import Application from 'test-app/app';
import config from 'test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import 'qunit-theme-ember/qunit.css';

setRunOptions({
  preload: false,
});

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
