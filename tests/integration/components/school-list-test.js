import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | school list', function(hooks) {
  setupRenderingTest(hooks);

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
    assert.dom('tbody tr:nth-of-type(1) td').hasText('school 0');
    assert.dom('tbody tr:nth-of-type(2) td').hasText('school 1');
  });

  test('create school button is visible to root', async function(assert) {
    assert.expect(1);
    const currentUserMock = Service.extend({
      isRoot: true
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`{{school-list schools=schools}}`);
    assert.dom('.header .actions .expand-button').exists({ count: 1 });
  });

  test('create school button is not visible to non root users', async function(assert) {
    assert.expect(1);
    const currentUserMock = Service.extend({
      root: false
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`{{school-list schools=schools}}`);
    assert.dom('.header .actions .expand-button').doesNotExist();
  });
});
