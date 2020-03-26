import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/learner-selection-manager';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | learner selection manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const learner1 = this.server.create('user', {firstName: 'Joe', lastName: 'Doe', middleName: 'Michael'});
    const learner2 = this.server.create('user', {firstName: 'Jane', lastName: 'Doe', middleName: 'Anette'});
    this.learnerModel1 =  await this.owner.lookup('service:store').find('user', learner1.id);
    this.learnerModel2 =  await this.owner.lookup('service:store').find('user', learner2.id);
  });

  test('selected learners', async function(assert) {
    assert.expect(4);
    this.set('learners', [this.learnerModel1,  this.learnerModel2]);
    await render(hbs`<LearnerSelectionManager @learners={{this.learners}} @add={{noop}} @remove={{noop}}/>`);
    assert.equal(component.selectedLearners.heading, 'Selected Learners');
    assert.equal(component.selectedLearners.detailLearnerList.learners.length, 2);
    assert.equal(component.selectedLearners.detailLearnerList.learners[0].userName, "Jane A. Doe");
    assert.equal(component.selectedLearners.detailLearnerList.learners[1].userName, "Joe M. Doe");
  });

  test('no selected learners', async function(assert) {
    assert.expect(3);
    this.set('learners', []);
    await render(hbs`<LearnerSelectionManager @learners={{this.learners}} @add={{noop}} @remove={{noop}}/>`);
    assert.equal(component.selectedLearners.heading, 'Selected Learners');
    assert.notOk(component.selectedLearners.detailLearnerList.isVisible);
    assert.equal(component.selectedLearners.noLearners.text, 'None');
  });

  test('remove selected learner', async function(assert) {
    assert.expect(4);
    this.set('learners', [this.learnerModel1,  this.learnerModel2]);
    this.set('remove', user => {
      assert.equal(user.id, this.learnerModel1.id);
    });
    await render(hbs`<LearnerSelectionManager @learners={{this.learners}} @add={{noop}} @remove={{remove}}/>`);
    assert.equal(component.selectedLearners.heading, 'Selected Learners');
    assert.equal(component.selectedLearners.detailLearnerList.learners.length, 2);
    assert.equal(component.selectedLearners.detailLearnerList.learners[1].userName, "Joe M. Doe");
    await component.selectedLearners.detailLearnerList.learners[1].remove();
  });

  test('search and add learner', async function(assert) {
    assert.expect(3);
    const learner3 = this.server.create('user', { firstName: 'Jim', middleName: 'Roy', lastName: 'Schmitt'});
    const learnerModel3 = await this.owner.lookup('service:store').find('user', learner3.id);

    this.set('learners', []);
    this.set('add', (user) => {
      assert.equal(user.id, learnerModel3.id);
    });
    await render(hbs`<LearnerSelectionManager @learners={{this.learners}} @add={{this.add}} @remove={{noop}}/>`);
    await component.search('Schmitt');
    assert.equal(component.searchResults.length, 1);
    assert.equal(component.searchResults[0].fullName, 'Jim R. Schmitt');
    await component.searchResults[0].add();
  });
});
