import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/detail-learner-list';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | detail learner list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const learner1 = this.server.create('user', {firstName: 'Joe', lastName: 'Doe', middleName: 'Michael'});
    const learner2 = this.server.create('user', {firstName: 'Jane', lastName: 'Doe', middleName: 'Anette'});
    this.learnerModel1 =  await this.owner.lookup('service:store').find('user', learner1.id);
    this.learnerModel2 =  await this.owner.lookup('service:store').find('user', learner2.id);
  });


  test('it renders', async function(assert) {
    assert.expect(3);
    this.set('learners', [this.learnerModel1, this.learnerModel2]);
    await render(hbs`<DetailLearnerList @learners={{this.learners}} @remove={{noop}} />`);
    assert.equal(component.learners.length, 2);
    assert.equal(component.learners[0].userName, "Jane A. Doe");
    assert.equal(component.learners[1].userName, "Joe M. Doe");
  });

  test('remove learner from list', async function(assert) {
    assert.expect(3);
    this.set('learners', [this.learnerModel1, this.learnerModel2]);
    this.set('remove', (user) => {
      assert.equal(user.id, this.learnerModel2.id);
    });
    await render(hbs`<DetailLearnerList @learners={{this.learners}} @remove={{this.remove}} @isManaging={{true}} />`);
    assert.equal(component.learners.length, 2);
    assert.equal(component.learners[0].userName, "Jane A. Doe");
    await component.learners[0].remove();
  });
});
