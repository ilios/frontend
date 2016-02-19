import resolver from './helpers/resolver';

import registerSelectHelper from './helpers/register-select-helper';
registerSelectHelper();

import {
  setResolver
} from 'ember-qunit';

import './helpers/flash-message';
import './helpers/custom-helpers';

setResolver(resolver);
