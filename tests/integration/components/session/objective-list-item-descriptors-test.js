import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/session/objective-list-item-descriptors';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/objective-list-item-descriptors', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders and is accessible when managing', async function (assert) {
    await render(hbs`<Session::ObjectiveListItemDescriptors
      @sessionObjective={{null}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.ok(component.canSave);
    assert.ok(component.canCancel);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible empty and un-editable', async function (assert) {
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    await render(hbs`<Session::ObjectiveListItemDescriptors
      @sessionObjective={{this.sessionObjective}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.strictEqual(component.text, 'None');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible un-editable', async function (assert) {
    const meshDescriptors = this.server.createList('meshDescriptor', 2);
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
      meshDescriptors,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    await render(hbs`<Session::ObjectiveListItemDescriptors
      @sessionObjective={{this.sessionObjective}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.strictEqual(component.list.length, 2);
    assert.strictEqual(component.list[0].title, 'descriptor 0');
    assert.strictEqual(component.list[1].title, 'descriptor 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible editable', async function (assert) {
    const meshDescriptors = this.server.createList('meshDescriptor', 2);
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
      meshDescriptors,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    await render(hbs`<Session::ObjectiveListItemDescriptors
      @sessionObjective={{this.sessionObjective}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.strictEqual(component.list.length, 2);
    assert.strictEqual(component.list[0].title, 'descriptor 0');
    assert.strictEqual(component.list[1].title, 'descriptor 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking save fires save', async function (assert) {
    assert.expect(1);
    const meshDescriptors = this.server.createList('meshDescriptor', 2);
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
      meshDescriptors,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(hbs`<Session::ObjectiveListItemDescriptors
      @sessionObjective={{this.sessionObjective}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{this.save}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    await component.save();
  });

  test('clicking cancel fires cancel', async function (assert) {
    assert.expect(1);
    const meshDescriptors = this.server.createList('meshDescriptor', 2);
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
      meshDescriptors,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(hbs`<Session::ObjectiveListItemDescriptors
      @sessionObjective={{this.sessionObjective}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{this.cancel}}
    />`);
    await component.cancel();
  });

  test('clicking descriptor fires manage', async function (assert) {
    assert.expect(1);
    const meshDescriptors = this.server.createList('meshDescriptor', 2);
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
      meshDescriptors,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('manage', () => {
      assert.ok(true);
    });
    await render(hbs`<Session::ObjectiveListItemDescriptors
      @sessionObjective={{this.sessionObjective}}
      @editable={{true}}
      @manage={{this.manage}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    await component.list[0].manage();
  });
});
