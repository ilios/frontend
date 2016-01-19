import resolver from './helpers/resolver';

import registerSelectHelper from './helpers/register-select-helper';
registerSelectHelper();

import {
  setResolver
} from 'ember-qunit';
import Ember from 'ember';

import './helpers/flash-message';
import './helpers/custom-helpers';

setResolver(resolver);

Ember.Inflector.inflector.uncountable('aamc-pcrs');
