import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/detail-learnergroups-list';

module('Integration | Component | detail-learnergroups-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const program = this.server.create('program');
    const programYear = this.server.create('program-year', { program });
    const programYear2 = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const cohort2 = this.server.create('cohort', { programYear: programYear2 });
    const users = this.server.createList('user', 5);
    const tlg1 = this.server.create('learner-group', {
      title: 'tlg1',
      users: [users[0], users[1]],
      cohort,
    });
    const subGroup1 = this.server.create('learner-group', {
      title: 'sub group 1',
      parent: tlg1,
      users: [users[0], users[1], users[2]],
      cohort,
    });
    const subSubGroup1 = this.server.create('learner-group', {
      title: 'sub sub group 1',
      parent: subGroup1,
      users: [users[0]],
      cohort,
    });

    const tlg2 = this.server.create('learner-group', {
      title: 'tlg2',
      users: [users[0], users[1]],
      cohort: cohort2,
    });
    const subGroup2 = this.server.create('learner-group', {
      title: 'sub group 2',
      parent: tlg2,
      cohort: cohort2,
    });
    const store = this.owner.lookup('service:store');
    this.tlg1 = await store.findRecord('learner-group', tlg1.id);
    this.tlg2 = await store.findRecord('learner-group', tlg2.id);
    this.subGroup1 = await store.findRecord('learner-group', subGroup1.id);
    this.subSubGroup = await store.findRecord('learner-group', subSubGroup1.id);
    this.subGroup2 = await store.findRecord('learner-group', subGroup2.id);
  });

  test('it renders', async function (assert) {
    this.set('learnerGroups', [
      this.tlg1,
      this.tlg2,
      this.subGroup1,
      this.subSubGroup,
      this.subGroup2,
    ]);
    await render(hbs`<DetailLearnergroupsList
      @learnerGroups={{this.learnerGroups}}
      @remove={{(noop)}}
    />
`);
    assert.strictEqual(component.trees.length, 2);
    assert.strictEqual(component.trees[0].title, 'program 0 cohort 0');
    assert.strictEqual(component.trees[0].items.length, 3);
    assert.strictEqual(component.trees[0].items[0].text, 'tlg1 (2)');
    assert.strictEqual(component.trees[0].items[1].text, 'tlg1 » sub group 1 (3)');
    assert.strictEqual(
      component.trees[0].items[2].text,
      'tlg1 » sub group 1 » sub sub group 1 (1)'
    );
    assert.strictEqual(component.trees[1].title, 'program 0 cohort 1');
    assert.strictEqual(component.trees[1].items.length, 2);
    assert.strictEqual(component.trees[1].items[0].text, 'tlg2 (2)');
    assert.strictEqual(component.trees[1].items[1].text, 'tlg2 » sub group 2 (0)');
  });

  test('remove', async function (assert) {
    assert.expect(1);
    this.set('learnerGroups', [this.tlg1]);
    this.set('remove', (learnerGroup) => {
      assert.strictEqual(this.tlg1, learnerGroup);
    });
    await render(hbs`<DetailLearnergroupsList
      @learnerGroups={{this.learnerGroups}}
      @remove={{this.remove}}
      @isManaging={{true}}
    />
`);
    await component.trees[0].items[0].remove();
  });
});
