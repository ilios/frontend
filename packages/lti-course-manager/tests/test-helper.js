import '@warp-drive/ember/install'; // must be first in this file

import Application from 'lti-course-manager/app';
import config from 'lti-course-manager/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation } from 'ember-qunit';

import start from 'ember-exam/test-support/start';

setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();
start();
