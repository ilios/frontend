import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';

const { Object:EmberObject, RSVP, Service } = Ember;
const { resolve } = RSVP;

moduleForComponent('school-list', 'Integration | Component | school list', {
  integration: true,
  beforeEach(){
    initializer.initialize(this);
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  let school1 = server.create('school');
  let school2 = server.create('school');

  const schools = [school1, school2].map(obj => EmberObject.create(obj));

  this.set('schools', schools);
  this.render(hbs`{{school-list schools=schools}}`);
  assert.equal(this.$('tr:eq(1) td:eq(0)').text().trim(), 'school 0');
  assert.equal(this.$('tr:eq(2) td:eq(0)').text().trim(), 'school 1');
});

test('create school button is visible to developers', function(assert) {
  assert.expect(1);
  const currentUserMock = Service.extend({
    userIsDeveloper: resolve(true)
  });
  this.register('service:current-user', currentUserMock);
  this.set('schools', []);
  this.render(hbs`{{school-list schools=schools}}`);
  assert.equal(this.$('.header .actions .expand-button').length, 1);
});

test('create school button is not visible to non-developers', function(assert) {
  assert.expect(1);
  const currentUserMock = Service.extend({
    userIsDeveloper: resolve(false)
  });
  this.register('service:current-user', currentUserMock);
  this.set('schools', []);
  this.render(hbs`{{school-list schools=schools}}`);
  assert.equal(this.$('.header .actions .expand-button').length, 0);
});
