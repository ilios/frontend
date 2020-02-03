import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import ENV from 'dummy/config/environment';

module('Integration | Component | learnergroup-tree', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const thirdLevelLearnerGroup1 = this.server.create('learner-group', { title: 'Third 1' });
    const thirdLevelLearnerGroup2 = this.server.create('learner-group', { title: 'Third 2' });
    const thirdLevelLearnerGroup3 = this.server.create('learner-group', { title: 'Third 3' });
    const secondLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Second 1',
      children: [ thirdLevelLearnerGroup1, thirdLevelLearnerGroup2 ]
    });
    const secondLevelLearnerGroup2 = this.server.create('learner-group', {
      title: 'Second 2',
      children: [ thirdLevelLearnerGroup3 ]
    });
    const secondLevelLearnerGroup3 = this.server.create('learner-group', { title: 'Second 3' });
    const topLevelLearnerGroup = this.server.create('learner-group', {
      title: 'Top Group',
      children: [ secondLevelLearnerGroup1, secondLevelLearnerGroup2, secondLevelLearnerGroup3 ]
    });

    this.topLevelLearnerGroup =
      await this.owner.lookup('service:store').find('learner-group', topLevelLearnerGroup.id);
    this.secondLevelLearnerGroup1 =
      await this.owner.lookup('service:store').find('learner-group', secondLevelLearnerGroup1.id);
    this.secondLevelLearnerGroup2 =
      await this.owner.lookup('service:store').find('learner-group', secondLevelLearnerGroup2.id);
    this.secondLevelLearnerGroup3 =
      await this.owner.lookup('service:store').find('learner-group', secondLevelLearnerGroup3.id);
    this.thirdLevelLearnerGroup1 =
      await this.owner.lookup('service:store').find('learner-group', thirdLevelLearnerGroup1.id);
    this.thirdLevelLearnerGroup2 =
      await this.owner.lookup('service:store').find('learner-group', thirdLevelLearnerGroup2.id);
    this.thirdLevelLearnerGroup3 =
      await this.owner.lookup('service:store').find('learner-group', thirdLevelLearnerGroup3.id);
  });

  test('the group tree renders', async function(assert) {
    assert.expect(8);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('nothing', parseInt);

    await render(hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{action this.nothing}} />`);
    // feels kludgly, but i can't figure out a different/better way
    // to correctly anchor this element tree otherwise for CSS selectors below.
    // [ST 2020/02/03]
    const rootElem = ENV.APP.rootElement;
    const testSelector = '[data-test-learnergroup-tree]';
    assert.dom(`${testSelector}`).exists({ count: 7 });
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > span`).hasText('Top Group');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > span`).hasText('Second 1');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2) > span`).hasText('Second 2');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(3) > span`).hasText('Second 3');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > span`
    ).hasText('Third 1');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2) > span`
    ).hasText('Third 2');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2) > ul > ${testSelector}:nth-of-type(1) > span`
    ).hasText('Third 3');
  });

  test('branches and leaves are styled accordingly', async function(assert) {
    assert.expect(7);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('nothing', parseInt);

    await render(hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{action this.nothing}} />`);
    const rootElem = ENV.APP.rootElement;
    const testSelector = '[data-test-learnergroup-tree]';
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1)`).hasClass('strong');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1)`).hasClass('strong');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2)`).hasClass('strong');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(3)`).hasClass('em');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1)`
    ).hasClass('em');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2)`
    ).hasClass('em');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2) > ul > ${testSelector}:nth-of-type(1)`
    ).hasClass('em');
  });

  test('selected groups are hidden from view', async function(assert) {
    assert.expect(7);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', [this.thirdLevelLearnerGroup2, this.thirdLevelLearnerGroup3, this.secondLevelLearnerGroup2]);
    this.set('nothing', parseInt);
    await render(hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{action this.nothing}} />`);
    const rootElem = ENV.APP.rootElement;
    const testSelector = '[data-test-learnergroup-tree]';
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1)`).hasNoAttribute('hidden');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1)`).hasNoAttribute('hidden');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2)`).hasAttribute('hidden');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(3)`).hasNoAttribute('hidden');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1)`
    ).hasNoAttribute('hidden');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2)`
    ).hasAttribute('hidden');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2) > ul > ${testSelector}:nth-of-type(1)`
    ).hasAttribute('hidden');
  });

  test('filter by learner group title', async function(assert) {
    assert.expect(7);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups');
    this.set('filter', 'Second 2');
    this.set('nothing', parseInt);
    await render(hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @filter={{this.filter}} @add={{action this.nothing}} />`);
    const rootElem = ENV.APP.rootElement;
    const testSelector = '[data-test-learnergroup-tree]';
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1)`).hasNoAttribute('hidden');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1)`).hasAttribute('hidden');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2)`).hasNoAttribute('hidden');
    assert.dom(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(3)`).hasAttribute('hidden');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1)`
    ).hasAttribute('hidden');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2)`
    ).hasAttribute('hidden');
    assert.dom(
      `${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2) > ul > ${testSelector}:nth-of-type(1)`
    ).hasNoAttribute('hidden');
  });

  test('add action fires', async function(assert) {
    assert.expect(1);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('add', (learnerGroup) => {
      assert.equal(learnerGroup, this.thirdLevelLearnerGroup2);
    });
    await render(hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{action this.add}} />`);
    const rootElem = ENV.APP.rootElement;
    const testSelector = '[data-test-learnergroup-tree]';
    await click(`${rootElem} > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(1) > ul > ${testSelector}:nth-of-type(2) > span`);
  });
});
