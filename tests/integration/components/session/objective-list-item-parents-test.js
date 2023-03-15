import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/session/objective-list-item-parents';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/objective-list-item-parents', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const courseObjective1 = this.server.create('courseObjective', {
      title: '<p>Country &amp; Western</p>',
    });
    const courseObjective2 = this.server.create('courseObjective');
    this.courseObjective1 = await this.owner
      .lookup('service:store')
      .findRecord('courseObjective', courseObjective1.id);
    this.courseObjective2 = await this.owner
      .lookup('service:store')
      .findRecord('courseObjective', courseObjective2.id);
  });

  test('it renders and is accessible when managing', async function (assert) {
    await render(hbs`<Session::ObjectiveListItemParents
      @parents={{(array)}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.ok(component.canSave);
    assert.ok(component.canCancel);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible empty and un-editable', async function (assert) {
    await render(hbs`<Session::ObjectiveListItemParents
      @parents={{(array)}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.text, 'None');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible un-editable', async function (assert) {
    this.set('parents', [this.courseObjective1, this.courseObjective2]);
    await render(hbs`<Session::ObjectiveListItemParents
      @parents={{this.parents}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.list.length, 2);
    assert.strictEqual(component.list[0].text, 'Country & Western');
    assert.strictEqual(component.list[1].text, 'course objective 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible editable', async function (assert) {
    this.set('parents', [this.courseObjective1, this.courseObjective2]);
    await render(hbs`<Session::ObjectiveListItemParents
      @parents={{this.parents}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.list.length, 2);
    assert.strictEqual(component.list[0].text, 'Country & Western');
    assert.strictEqual(component.list[1].text, 'course objective 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking save fires save', async function (assert) {
    assert.expect(1);
    this.set('save', () => {
      assert.ok(true);
    });
    this.set('parents', [this.courseObjective1, this.courseObjective2]);
    await render(hbs`<Session::ObjectiveListItemParents
      @parents={{this.parents}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{this.save}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    await component.save();
  });

  test('clicking cancel fires cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true);
    });
    this.set('parents', [this.courseObjective1, this.courseObjective2]);
    await render(hbs`<Session::ObjectiveListItemParents
      @parents={{this.parents}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{this.cancel}}
    />
`);
    await component.cancel();
  });

  test('clicking objective fires manage', async function (assert) {
    assert.expect(1);
    this.set('manage', () => {
      assert.ok(true);
    });
    this.set('parents', [this.courseObjective1, this.courseObjective2]);
    await render(hbs`<Session::ObjectiveListItemParents
      @parents={{this.parents}}
      @editable={{true}}
      @manage={{this.manage}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    await component.list[0].manage();
  });

  test('parent objectives are correctly sorted', async function (assert) {
    const courseObjective1 = this.server.create('courseObjective', {
      title: 'Aardvark',
      position: 3,
    });
    const courseObjective2 = this.server.create('courseObjective', {
      title: 'Zeppelin',
      position: 2,
    });
    const courseObjective3 = this.server.create('courseObjective', {
      title: 'Oscar',
      position: 1,
    });
    const model1 = await this.owner
      .lookup('service:store')
      .findRecord('courseObjective', courseObjective1.id);
    const model2 = await this.owner
      .lookup('service:store')
      .findRecord('courseObjective', courseObjective2.id);
    const model3 = await this.owner
      .lookup('service:store')
      .findRecord('courseObjective', courseObjective3.id);
    this.set('parents', [model1, model2, model3]);
    await render(hbs`<Session::ObjectiveListItemParents
      @parents={{this.parents}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.list.length, 3);
    assert.strictEqual(component.list[0].text, 'Oscar');
    assert.strictEqual(component.list[1].text, 'Zeppelin');
    assert.strictEqual(component.list[2].text, 'Aardvark');
  });
});
