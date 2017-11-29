import Application from '../app';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import './helpers/flash-message';
import './helpers/custom-helpers';

setApplication(Application.create({ autoboot: false }));

start();
