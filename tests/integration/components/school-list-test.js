import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
const { resolve } = RSVP;

module('Integration | Component | school list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    initializer.initialize(this);
  });

  test('it renders', async function(assert) {
    let school1 = EmberObject.create({
      id: 1,
      title: 'school 0'
    });
    let school2 = EmberObject.create({
      id: 2,
      title: 'school 1'
    });

    const schools = [school1, school2].map(obj => EmberObject.create(obj));

    this.set('schools', schools);
    await render(hbs`{{school-list schools=schools}}`);
    assert.equal(this.$('tr:eq(1) td:eq(0)').text().trim(), 'school 0');
    assert.equal(this.$('tr:eq(2) td:eq(0)').text().trim(), 'school 1');
  });

  test('create school button is visible to developers', async function(assert) {
    assert.expect(1);
    const currentUserMock = Service.extend({
      userIsDeveloper: resolve(true)
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`{{school-list schools=schools}}`);
    assert.equal(this.$('.header .actions .expand-button').length, 1);
  });

  test('create school button is not visible to non-developers', async function(assert) {
    assert.expect(1);
    const currentUserMock = Service.extend({
      userIsDeveloper: resolve(false)
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`{{school-list schools=schools}}`);
    assert.equal(this.$('.header .actions .expand-button').length, 0);
  });
});
