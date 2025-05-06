import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/learner-selection-manager';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import LearnerSelectionManager from 'ilios-common/components/learner-selection-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | learner selection manager', function (hooks) {
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
    const learner3 = this.server.create('user', {
      displayName: 'Clem Chowder',
    });

    this.learnerModel1 = await this.owner.lookup('service:store').findRecord('user', learner1.id);
    this.learnerModel2 = await this.owner.lookup('service:store').findRecord('user', learner2.id);
    this.learnerModel3 = await this.owner.lookup('service:store').findRecord('user', learner3.id);
  });

  test('selected learners', async function (assert) {
    this.set('learners', [this.learnerModel1, this.learnerModel2, this.learnerModel3]);
    await render(
      <template>
        <LearnerSelectionManager @learners={{this.learners}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.selectedLearners.heading, 'Selected Learners:');
    assert.strictEqual(component.selectedLearners.learners.length, 3);
    assert.strictEqual(
      component.selectedLearners.learners[0].userNameInfo.fullName,
      'Clem Chowder',
    );
    assert.ok(component.selectedLearners.learners[0].userNameInfo.hasAdditionalInfo);
    assert.notOk(component.selectedLearners.learners[0].userNameInfo.isTooltipVisible);
    await component.selectedLearners.learners[0].userNameInfo.expandTooltip();
    assert.ok(component.selectedLearners.learners[0].userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.selectedLearners.learners[0].userNameInfo.tooltipContents,
      'Campus name of record: 2 guy M, Mc2son',
    );
    await component.selectedLearners.learners[0].userNameInfo.closeTooltip();
    assert.notOk(component.selectedLearners.learners[0].userNameInfo.isTooltipVisible);
    assert.strictEqual(component.selectedLearners.learners[1].userNameInfo.fullName, 'Jane A. Doe');
    assert.notOk(component.selectedLearners.learners[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.selectedLearners.learners[2].userNameInfo.fullName, 'Joe M. Doe');
    assert.notOk(component.selectedLearners.learners[2].userNameInfo.hasAdditionalInfo);
  });

  test('no selected learners', async function (assert) {
    this.set('learners', []);
    await render(
      <template>
        <LearnerSelectionManager @learners={{this.learners}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.selectedLearners.heading, 'Selected Learners:');
    assert.strictEqual(component.selectedLearners.noLearners.text, 'None');
  });

  test('remove selected learner', async function (assert) {
    assert.expect(4);
    this.set('learners', [this.learnerModel1, this.learnerModel2]);
    this.set('remove', (user) => {
      assert.strictEqual(user.id, this.learnerModel1.id);
    });
    await render(
      <template>
        <LearnerSelectionManager
          @learners={{this.learners}}
          @add={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedLearners.heading, 'Selected Learners:');
    assert.strictEqual(component.selectedLearners.learners.length, 2);
    assert.strictEqual(component.selectedLearners.learners[1].userNameInfo.fullName, 'Joe M. Doe');
    await component.selectedLearners.learners[1].remove();
  });

  test('search and add learner', async function (assert) {
    assert.expect(3);
    const learner3 = this.server.create('user', {
      firstName: 'Jim',
      middleName: 'Roy',
      lastName: 'Schmitt',
    });
    const learnerModel3 = await this.owner.lookup('service:store').findRecord('user', learner3.id);

    this.set('learners', []);
    this.set('add', (user) => {
      assert.strictEqual(user.id, learnerModel3.id);
    });
    await render(
      <template>
        <LearnerSelectionManager @learners={{this.learners}} @add={{this.add}} @remove={{(noop)}} />
      </template>,
    );
    await component.search.searchBox.set('Schmitt');
    assert.strictEqual(component.search.results.items.length, 1);
    assert.strictEqual(component.search.results.items[0].text, 'Jim R. Schmitt user@example.edu');
    await component.search.results.items[0].click();
  });
});
