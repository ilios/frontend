import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/selected-learners';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | selected-learners', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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

  test('it renders', async function (assert) {
    this.set('learners', [this.learnerModel1, this.learnerModel2, this.learnerModel3]);
    await render(hbs`<SelectedLearners @learners={{this.learners}} />
`);
    assert.strictEqual(component.heading, 'Selected Learners:');
    assert.strictEqual(component.learners.length, 3);
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('no selected learners', async function (assert) {
    this.set('learners', []);
    await render(hbs`<SelectedLearners @learners={{this.learners}} />
`);
    assert.strictEqual(component.heading, 'Selected Learners:');
    assert.strictEqual(component.noLearners.text, 'None');
  });

  test('remove selected learner', async function (assert) {
    assert.expect(4);
    this.set('learners', [this.learnerModel1, this.learnerModel2]);
    this.set('remove', (user) => {
      assert.strictEqual(user.id, this.learnerModel1.id);
    });
    await render(
      hbs`<SelectedLearners @learners={{this.learners}} @isManaging={{true}} @remove={{this.remove}}/>
`
    );
    assert.strictEqual(component.heading, 'Selected Learners:');
    assert.strictEqual(component.learners.length, 2);
    assert.strictEqual(component.learners[1].userNameInfo.fullName, 'Joe M. Doe');
    await component.learners[1].remove();
  });
});
