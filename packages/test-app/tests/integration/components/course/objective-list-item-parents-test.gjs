import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/course/objective-list-item-parents';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import ObjectiveListItemParents from 'ilios-common/components/course/objective-list-item-parents';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | course/objective-list-item-parents', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const programYearObjective1 = this.server.create('program-year-objective', {
      title: '<p>Country &amp; Western</p>',
    });
    const programYearObjective2 = this.server.create('program-year-objective');
    this.programYearObjective1 = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', programYearObjective1.id);
    this.programYearObjective2 = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', programYearObjective2.id);
  });

  test('it renders and is accessible when managing', async function (assert) {
    await render(
      <template>
        <ObjectiveListItemParents
          @parents={{(array)}}
          @editable={{false}}
          @manage={{(noop)}}
          @isManaging={{true}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.canSave);
    assert.ok(component.canCancel);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible empty and un-editable', async function (assert) {
    await render(
      <template>
        <ObjectiveListItemParents
          @parents={{(array)}}
          @editable={{false}}
          @manage={{(noop)}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.text, 'None');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible un-editable', async function (assert) {
    this.set('parents', [this.programYearObjective1, this.programYearObjective2]);
    await render(
      <template>
        <ObjectiveListItemParents
          @parents={{this.parents}}
          @editable={{false}}
          @manage={{(noop)}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.list.length, 2);
    assert.strictEqual(component.list[0].text, 'Country & Western');
    assert.strictEqual(component.list[1].text, 'program-year objective 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible editable', async function (assert) {
    this.set('parents', [this.programYearObjective1, this.programYearObjective2]);
    await render(
      <template>
        <ObjectiveListItemParents
          @parents={{this.parents}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.list.length, 2);
    assert.strictEqual(component.list[0].text, 'Country & Western');
    assert.strictEqual(component.list[1].text, 'program-year objective 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking save fires save', async function (assert) {
    assert.expect(1);
    this.set('save', () => {
      assert.ok(true);
    });
    this.set('parents', [this.programYearObjective1, this.programYearObjective2]);
    await render(
      <template>
        <ObjectiveListItemParents
          @parents={{this.parents}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{true}}
          @save={{this.save}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    await component.save();
  });

  test('clicking cancel fires cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true);
    });
    this.set('parents', [this.programYearObjective1, this.programYearObjective2]);
    await render(
      <template>
        <ObjectiveListItemParents
          @parents={{this.parents}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{true}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{this.cancel}}
        />
      </template>,
    );
    await component.cancel();
  });

  test('clicking objective fires manage', async function (assert) {
    assert.expect(1);
    this.set('manage', () => {
      assert.ok(true);
    });
    this.set('parents', [this.programYearObjective1, this.programYearObjective2]);
    await render(
      <template>
        <ObjectiveListItemParents
          @parents={{this.parents}}
          @editable={{true}}
          @manage={{this.manage}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    await component.manage();
  });
});
