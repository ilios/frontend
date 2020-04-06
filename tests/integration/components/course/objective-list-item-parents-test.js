import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios-common/page-objects/components/course/objective-list-item-parents';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/objective-list-item-parents', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible when managing', async function(assert) {
    await render(hbs`<Course::ObjectiveListItemParents
      @objective={{null}}
      @editable={{false}}
      @manage={{noop}}
      @isManaging={{true}}
      @save={{noop}}
      @isSaving={{false}}
      @cancel={{noop}}
    />`);
    assert.ok(component.canSave);
    assert.ok(component.canCancel);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible empty and un-editable', async function(assert) {
    const objective = this.server.create('objective');
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);
    await render(hbs`<Course::ObjectiveListItemParents
      @objective={{this.objective}}
      @editable={{false}}
      @manage={{noop}}
      @isManaging={{false}}
      @save={{noop}}
      @isSaving={{false}}
      @cancel={{noop}}
    />`);
    assert.equal(component.text, 'None');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible un-editable', async function (assert) {
    const parents = this.server.createList('objective', 2);
    const objective = this.server.create('objective', {
      parents,
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);
    await render(hbs`<Course::ObjectiveListItemParents
      @objective={{this.objective}}
      @editable={{false}}
      @manage={{noop}}
      @isManaging={{false}}
      @save={{noop}}
      @isSaving={{false}}
      @cancel={{noop}}
    />`);
    assert.equal(component.list.length, 2);
    assert.equal(component.list[0].text, 'objective 0');
    assert.equal(component.list[1].text, 'objective 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible editable', async function (assert) {
    const parents = this.server.createList('objective', 2);
    const objective = this.server.create('objective', {
      parents,
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);
    await render(hbs`<Course::ObjectiveListItemParents
      @objective={{this.objective}}
      @editable={{true}}
      @manage={{noop}}
      @isManaging={{false}}
      @save={{noop}}
      @isSaving={{false}}
      @cancel={{noop}}
    />`);
    assert.equal(component.list.length, 2);
    assert.equal(component.list[0].text, 'objective 0');
    assert.equal(component.list[1].text, 'objective 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking save fires save', async function (assert) {
    assert.expect(1);
    const parents = this.server.createList('objective', 2);
    const objective = this.server.create('objective', {
      parents,
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(hbs`<Course::ObjectiveListItemParents
      @objective={{this.objective}}
      @editable={{true}}
      @manage={{noop}}
      @isManaging={{true}}
      @save={{this.save}}
      @isSaving={{false}}
      @cancel={{noop}}
    />`);
    await component.save();
  });

  test('clicking cancel fires cancel', async function (assert) {
    assert.expect(1);
    const parents = this.server.createList('objective', 2);
    const objective = this.server.create('objective', {
      parents,
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(hbs`<Course::ObjectiveListItemParents
      @objective={{this.objective}}
      @editable={{true}}
      @manage={{noop}}
      @isManaging={{true}}
      @save={{noop}}
      @isSaving={{false}}
      @cancel={{this.cancel}}
    />`);
    await component.cancel();
  });

  test('clicking objective fires manage', async function (assert) {
    assert.expect(1);
    const parents = this.server.createList('objective', 2);
    const objective = this.server.create('objective', {
      parents,
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);
    this.set('manage', () => {
      assert.ok(true);
    });
    await render(hbs`<Course::ObjectiveListItemParents
      @objective={{this.objective}}
      @editable={{true}}
      @manage={{this.manage}}
      @isManaging={{false}}
      @save={{noop}}
      @isSaving={{false}}
      @cancel={{noop}}
    />`);
    await component.list[0].manage();
  });
});
