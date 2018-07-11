import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/user-menu';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { percySnapshot } from 'ember-percy';

module('Integration | Component | user-menu', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    let currentUserMock = Service.extend({
      model: resolve(EmberObject.create({
        fullName: 'Test Person'
      }))
    });
    this.owner.register('service:currentUser', currentUserMock);
  });

  test('it renders and is accessible', async function(assert) {
    await render(hbs`{{user-menu}}`);

    await a11yAudit(this.element);
    assert.equal(component.text, 'Test Person');
    percySnapshot(assert);

    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
    percySnapshot(assert);
  });

  test('click opens menu', async function(assert) {
    await render(hbs`{{user-menu}}`);

    assert.equal(component.links.length, 0);
    await component.toggle.click();
    assert.equal(component.links.length, 3);

  });

  test('down opens menu', async function(assert) {
    await render(hbs`{{user-menu}}`);

    assert.equal(component.links.length, 0);
    await component.toggle.down();
    assert.equal(component.links.length, 3);
  });

  test('escape closes menu', async function(assert) {
    await render(hbs`{{user-menu}}`);

    await component.toggle.down();
    assert.equal(component.links.length, 3);
    await component.toggle.esc();
    assert.equal(component.links.length, 0);
  });

  test('click closes menu', async function(assert) {
    await render(hbs`{{user-menu}}`);

    await component.toggle.down();
    assert.equal(component.links.length, 3);
    await component.toggle.click();
    assert.equal(component.links.length, 0);
  });
});
