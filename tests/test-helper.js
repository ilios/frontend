import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import './helpers/flash-message';
import './helpers/custom-helpers';

setApplication(Application.create(config.APP));

start();
