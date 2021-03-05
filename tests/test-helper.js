import Application from 'ilios/app';
import config from 'ilios/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

import './helpers/flash-message';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
