import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session/objective-list-item';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/objective-list-item', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function(assert) {
    assert.expect(6);
    const session = this.server.create('session');

    const objective = this.server.create('objective', {
      sessions: [session],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const sessionModel = await this.owner.lookup('service:store').find('session', objective.id);
    this.set('objective', objectiveModel);
    this.set('session', sessionModel);

    await render(
      hbs`<Session::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @session={{this.session}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageParents={{noop}}
        @manageDescriptors={{noop}}
      />`
    );
    assert.notOk(component.hasRemoveConfirmation);
    assert.equal(component.description.text, 'objective 0');
    assert.equal(component.parentsText, 'Add New');
    assert.equal(component.meshText, 'Add New');
    assert.ok(component.hasTrashCan);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('renders removable', async function (assert) {
    assert.expect(2);
    const session = this.server.create('session');

    const objective = this.server.create('objective', {
      sessions: [session],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const sessionModel = await this.owner.lookup('service:store').find('session', objective.id);
    this.set('objective', objectiveModel);
    this.set('session', sessionModel);

    await render(
      hbs`<Session::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @session={{this.session}}
        @showRemoveConfirmation={{true}}
        @remove={{noop}}
        @manageParents={{noop}}
        @manageDescriptors={{noop}}
      />`
    );
    assert.ok(component.hasRemoveConfirmation);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('can change title', async function(assert) {
    const session = this.server.create('session');

    const objective = this.server.create('objective', {
      sessions: [session],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const sessionModel = await this.owner.lookup('service:store').find('session', objective.id);
    this.set('objective', objectiveModel);
    this.set('session', sessionModel);

    await render(
      hbs`<Session::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @session={{this.session}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageParents={{noop}}
        @manageDescriptors={{noop}}
      />`
    );
    const newDescription = 'Pluto Visits Earth';
    assert.equal(component.description.text, 'objective 0');
    await component.description.openEditor();
    await component.description.edit(newDescription);
    await component.description.save();
    assert.equal(component.description.text, newDescription);
  });

  test('can manage parents', async function (assert) {
    const session = this.server.create('session');
    const objective = this.server.create('objective', {
      sessions: [session],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const sessionModel = await this.owner.lookup('service:store').find('session', objective.id);
    this.set('objective', objectiveModel);
    this.set('session', sessionModel);
    this.set('manageParents', () => {
      assert.ok(true);
    });

    await render(
      hbs`<Session::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @session={{this.session}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageParents={{fn this.manageParents}}
        @manageDescriptors={{noop}}
      />`
    );
    await component.manageParents();
  });

  test('can manage descriptors', async function (assert) {
    const session = this.server.create('session');
    const objective = this.server.create('objective', {
      sessions: [session],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const sessionModel = await this.owner.lookup('service:store').find('session', objective.id);
    this.set('objective', objectiveModel);
    this.set('session', sessionModel);
    this.set('manageDescriptors', () => {
      assert.ok(true);
    });

    await render(
      hbs`<Session::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @session={{this.session}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageParents={{noop}}
        @manageDescriptors={{fn this.manageDescriptors}}
      />`
    );
    await component.manageMesh();
  });

  test('can trigger removal', async function (assert) {
    const session = this.server.create('session');
    const objective = this.server.create('objective', {
      sessions: [session],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const sessionModel = await this.owner.lookup('service:store').find('session', objective.id);
    this.set('objective', objectiveModel);
    this.set('session', sessionModel);
    this.set('remove', () => {
      assert.ok(true);
    });

    await render(
      hbs`<Session::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @session={{this.session}}
        @showRemoveConfirmation={{false}}
        @remove={{fn this.remove}}
        @manageParents={{noop}}
        @manageDescriptors={{noop}}
      />`
    );
    await component.remove();
  });
});
