import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/detail-learner-list';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | detail learner list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const learner1 = this.server.create('user', {
      firstName: 'Joe',
      lastName: 'Doe',
      middleName: 'Michael',
    });
    const learner2 = this.server.create('user', {
      firstName: 'Jane',
      lastName: 'Doe',
      middleName: 'Anette',
    });
    const learner3 = this.server.create('user', { displayName: 'Aardvark' });
    this.learnerModel1 = await this.owner.lookup('service:store').find('user', learner1.id);
    this.learnerModel2 = await this.owner.lookup('service:store').find('user', learner2.id);
    this.learnerModel3 = await this.owner.lookup('service:store').find('user', learner3.id);
  });

  test('it renders', async function (assert) {
    this.set('learners', [this.learnerModel1, this.learnerModel2, this.learnerModel3]);
    await render(hbs`<DetailLearnerList @learners={{this.learners}} @isManaging={{false}} />`);
    assert.strictEqual(component.learners.length, 3);
    assert.strictEqual(component.learners[0].userNameInfo.fullName, 'Aardvark');
    assert.notOk(component.learners[0].isRemovable);
    assert.notOk(component.learners[0].userNameInfo.isTooltipVisible);
    await component.learners[0].userNameInfo.expandTooltip();
    assert.ok(component.learners[0].userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.learners[0].userNameInfo.tooltipContents,
      'Campus name of record: 2 guy M, Mc2son'
    );
    await component.learners[0].userNameInfo.closeTooltip();
    assert.strictEqual(component.learners[1].userNameInfo.fullName, 'Jane A. Doe');
    assert.notOk(component.learners[1].isRemovable);
    assert.strictEqual(component.learners[2].userNameInfo.fullName, 'Joe M. Doe');
    assert.notOk(component.learners[2].isRemovable);
  });

  test('it renders in managing mode', async function (assert) {
    this.set('learners', [this.learnerModel1, this.learnerModel2, this.learnerModel3]);
    await render(
      hbs`<DetailLearnerList @learners={{this.learners}} @isManaging={{true}} @remove={{(noop)}} />`
    );
    assert.strictEqual(component.learners.length, 3);
    assert.strictEqual(component.learners[0].userNameInfo.fullName, 'Aardvark');
    assert.ok(component.learners[0].isRemovable);
    assert.notOk(component.learners[0].userNameInfo.isTooltipVisible);
    await component.learners[0].userNameInfo.expandTooltip();
    assert.ok(component.learners[0].userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.learners[0].userNameInfo.tooltipContents,
      'Campus name of record: 2 guy M, Mc2son'
    );
    await component.learners[0].userNameInfo.closeTooltip();
    assert.strictEqual(component.learners[1].userNameInfo.fullName, 'Jane A. Doe');
    assert.ok(component.learners[1].isRemovable);
    assert.strictEqual(component.learners[2].userNameInfo.fullName, 'Joe M. Doe');
    assert.ok(component.learners[2].isRemovable);
  });

  test('remove learner from list', async function (assert) {
    assert.expect(3);
    this.set('learners', [this.learnerModel1, this.learnerModel2]);
    this.set('remove', (user) => {
      assert.strictEqual(user.id, this.learnerModel2.id);
    });
    await render(
      hbs`<DetailLearnerList @learners={{this.learners}} @isManaging={{true}} @remove={{this.remove}}/>`
    );
    assert.strictEqual(component.learners.length, 2);
    assert.strictEqual(component.learners[0].userNameInfo.fullName, 'Jane A. Doe');
    await component.learners[0].remove();
  });
});
