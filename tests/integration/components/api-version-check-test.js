import Service from '@ember/service';
import RSVP from 'rsvp';
import jQuery from 'jquery';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV.APP;

const { resolve } = RSVP;

moduleForComponent('api-version-check', 'Integration | Component | api version check', {
  integration: true
});

test('shows no warning when versions match', function(assert) {
  const iliosConfigMock = Service.extend({
    apiVersion: resolve(apiVersion)
  });
  const warningOverlay = '.api-version-check-warning';
  this.register('service:iliosConfig', iliosConfigMock);
  this.render(hbs`{{api-version-check}}`);
  assert.equal(jQuery(warningOverlay).length, 0);

});

test('shows warning on mismatch', function(assert) {
  const iliosConfigMock = Service.extend({
    apiVersion: resolve('bad')
  });
  const warningOverlay = '.api-version-check-warning';
  this.register('service:iliosConfig', iliosConfigMock);
  this.render(hbs`{{api-version-check}}`);
  assert.equal($(warningOverlay).length, 1);

});
