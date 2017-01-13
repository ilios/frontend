import resolver from './helpers/resolver';

import {
  setResolver
} from 'ember-qunit';

import './helpers/flash-message';
import './helpers/custom-helpers';

setResolver(resolver);
