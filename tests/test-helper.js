import resolver from './helpers/resolver';
import flashMessageHelper from './helpers/flash-message';

import {
  setResolver
} from 'ember-qunit';
import Ember from 'ember';
import { initialize } from 'ilios/initializers/ember-moment';
import customHelpers from './helpers/custom-helpers';

setResolver(resolver);

//setup ember-moment
initialize();

var inflector = Ember.Inflector.inflector;
// inflector.irregular('aamc-pcrs', 'aamc-pcrses');
inflector.uncountable('aamcPcrs');
inflector.uncountable('aamc-pcrs');

//set a default language
Ember.I18n.locale = 'en';
