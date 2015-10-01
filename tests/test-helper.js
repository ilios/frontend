// jshint unused:false
import resolver from './helpers/resolver';
import registerSelectHelper from './helpers/register-select-helper';
registerSelectHelper();
import flashMessageHelper from './helpers/flash-message';

import {
  setResolver
} from 'ember-qunit';
import Ember from 'ember';
import customHelpers from './helpers/custom-helpers';

setResolver(resolver);

Ember.Inflector.inflector.uncountable('aamc-pcrs');
