import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/course/objective-list-item';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/objective-list-item', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function(assert) {
    assert.expect(6);
    const course = this.server.create('course');

    const objective = this.server.create('objective', {
      courses: [course],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const courseModel = await this.owner.lookup('service:store').find('course', objective.id);
    this.set('objective', objectiveModel);
    this.set('course', courseModel);

    await render(
      hbs`<Course::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @course={{this.course}}
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
    const course = this.server.create('course');

    const objective = this.server.create('objective', {
      courses: [course],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const courseModel = await this.owner.lookup('service:store').find('course', objective.id);
    this.set('objective', objectiveModel);
    this.set('course', courseModel);

    await render(
      hbs`<Course::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @course={{this.course}}
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
    const course = this.server.create('course');

    const objective = this.server.create('objective', {
      courses: [course],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const courseModel = await this.owner.lookup('service:store').find('course', objective.id);
    this.set('objective', objectiveModel);
    this.set('course', courseModel);

    await render(
      hbs`<Course::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @course={{this.course}}
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
    const course = this.server.create('course');
    const objective = this.server.create('objective', {
      courses: [course],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const courseModel = await this.owner.lookup('service:store').find('course', objective.id);
    this.set('objective', objectiveModel);
    this.set('course', courseModel);
    this.set('manageParents', () => {
      assert.ok(true);
    });

    await render(
      hbs`<Course::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @course={{this.course}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageParents={{fn this.manageParents}}
        @manageDescriptors={{noop}}
      />`
    );
    await component.manageParents();
  });

  test('can manage descriptors', async function (assert) {
    const course = this.server.create('course');
    const objective = this.server.create('objective', {
      courses: [course],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const courseModel = await this.owner.lookup('service:store').find('course', objective.id);
    this.set('objective', objectiveModel);
    this.set('course', courseModel);
    this.set('manageDescriptors', () => {
      assert.ok(true);
    });

    await render(
      hbs`<Course::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @course={{this.course}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageParents={{noop}}
        @manageDescriptors={{fn this.manageDescriptors}}
      />`
    );
    await component.manageMesh();
  });

  test('can trigger removal', async function (assert) {
    const course = this.server.create('course');
    const objective = this.server.create('objective', {
      courses: [course],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const courseModel = await this.owner.lookup('service:store').find('course', objective.id);
    this.set('objective', objectiveModel);
    this.set('course', courseModel);
    this.set('remove', () => {
      assert.ok(true);
    });

    await render(
      hbs`<Course::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @course={{this.course}}
        @showRemoveConfirmation={{false}}
        @remove={{fn this.remove}}
        @manageParents={{noop}}
        @manageDescriptors={{noop}}
      />`
    );
    await component.remove();
  });
});
