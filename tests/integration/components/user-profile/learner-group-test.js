import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | user-profile/learner-group', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('programYear', {
      program,
      archived: false,
    });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const learnerGroup = this.server.create('learnerGroup', {
      cohort,
    });
    const model = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', model);
    await render(hbs`<UserProfile::LearnerGroup @learnerGroup={{this.learnerGroup}} />`);

    assert.dom(this.element).hasText('school 0: program 0 cohort 0 — learner group 0');
  });
});
