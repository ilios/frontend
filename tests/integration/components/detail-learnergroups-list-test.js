import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | detail learnergroups list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const set1 = 'fieldset:nth-of-type(1)';
    const set1Legend = set1 + ' legend';
    const set1Group1 = set1 + ' li:nth-of-type(1)';
    const set1Group2 = set1 + ' li:nth-of-type(2)';
    const set1Group3 = set1 + ' li:nth-of-type(3)';

    const set2 = 'fieldset:nth-of-type(2)';
    const set2Legend = set2 + ' legend';
    const set2Group1 = set2 + ' li:nth-of-type(1)';
    const set2Group2 = set2 + ' li:nth-of-type(2)';
    const users = this.server.createList('user', 5);

    const tlg1 = this.server.create('learner-group', {
      title: 'tlg1',
      users: [users[0], users[1]],
    });
    const subGroup1 = this.server.create('learner-group', {
      title: 'sub group 1',
      parent: tlg1,
      users: [users[0], users[1], users[2]],
    });
    const subSubGroup1 = this.server.create('learner-group', {
      title: 'sub sub group 1',
      parent: subGroup1,
      users: [users[0]],
    });

    const tlg2 = this.server.create('learner-group', {
      title: 'tlg2',
      users: [users[0], users[1]],
    });
    const subGroup2 = this.server.create('learner-group', {
      title: 'sub group 2',
      parent: tlg2,
    });
    const store = this.owner.lookup('service:store');
    const tlg1Model = await store.find('learner-group', tlg1.id);
    const subGroup1Model = await store.find('learner-group', subGroup1.id);
    const subSubGroupModel = await store.find('learner-group', subSubGroup1.id);
    const subGroup2Model = await store.find('learner-group', subGroup2.id);

    this.set('learnerGroups', [ tlg1Model, subGroup1Model, subSubGroupModel, subGroup2Model ]);
    this.set('nothing', () => {});

    await render(hbs`<DetailLearnergroupsList
      @learnerGroups={{learnerGroups}}
      @remove={{action nothing}}
    />`);

    assert.dom(set1Legend).hasText('tlg1 ( )');
    assert.dom(set1Group1).hasText('tlg1 (2)');
    assert.dom(set1Group2).hasText('sub group 1 (3)');
    assert.equal(find(set1Group3).textContent.trim().replace(/[\n\s]+/g, ''), 'subsubgroup1(1)');

    assert.dom(set2Legend).hasText('tlg2 ( )');
    assert.dom(set2Group1).hasText('tlg2 (2)');
    assert.dom(set2Group2).hasText('sub group 2 (0)');
  });
});
