import Application from 'ilios/app';
import config from 'ilios/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import './helpers/flash-message';

setApplication(Application.create(config.APP));

start();
