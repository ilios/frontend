import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV.APP;

const { Service, RSVP, $ } = Ember;
const { resolve } = RSVP;

moduleForComponent('api-version-check', 'Integration | Component | api version check', {
  integration: true
});

test('shows no warning when versions match', function(assert) {
  const iliosConfigMock = Service.extend({
    apiVersion: resolve(apiVersion)
  });
  this.register('service:iliosConfig', iliosConfigMock);
  this.render(hbs`{{api-version-check}}`);
  assert.equal($('.api-version-check-warning').length, 0);

});

test('shows warning on mismatch', function(assert) {
  const iliosConfigMock = Service.extend({
    apiVersion: resolve('bad')
  });
  this.register('service:iliosConfig', iliosConfigMock);
  this.render(hbs`{{api-version-check}}`);
  assert.equal($('.api-version-check-warning').length, 1);

});
