/* global $ */
import Ember from 'ember';
import { initialize } from '../../../initializers/froala';
import { module, test } from 'qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

var registry, application;

module('Unit | Initializer | froala' + testgroup, {
  beforeEach: function() {
    Ember.run(function() {
      application = Ember.Application.create();
      registry = application.registry;
      application.deferReadiness();
    });
  }
});

test('froala key is in the jquery global', function(assert) {
  initialize(registry, application);
  
  let key = $.Editable.DEFAULTS.key;
  assert.ok(key);
  assert.ok(key.length > 10);
});
