import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/collapsed-learnergroups';

module('Integration | Component | collapsed learnergroups', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('displays summary data', async function(assert) {
    const cohorts = [];
    for (let i = 1; i <= 2; i++) {
      const program = this.server.create('program');
      const programYear = this.server.create('program-year', { program });
      cohorts.pushObject(this.server.create('cohort', { programYear }));
    }
    this.server.create('learner-group', { cohort: cohorts[0] });
    this.server.create('learner-group', { cohort: cohorts[0] });
    this.server.create('learner-group', { cohort: cohorts[0] });
    this.server.create('learner-group', { cohort: cohorts[1] });

    const learnerGroups = this.owner.lookup('service:store').findAll('learner-group');
    const subject = EmberObject.create({
      learnerGroups: resolve(learnerGroups)
    });

    this.set('subject', subject);
    this.set('nothing', parseInt);
    await render(hbs`<CollapsedLearnergroups @subject={{subject}} @expand={{this.nothing}} />`);
    assert.equal(component.title, 'Learner Groups (4)');
    assert.equal(component.headers[0].text, 'Cohort');
    assert.equal(component.headers[1].text, 'Learner Groups');
    assert.equal(component.groups[0].cohort, 'program 0 cohort 0');
    assert.equal(component.groups[0].count, '3');
    assert.equal(component.groups[1].cohort, 'program 1 cohort 1');
    assert.equal(component.groups[1].count, '1');
  });

  test('clicking expand icon opens full view', async function(assert) {
    assert.expect(2);

    const subject = EmberObject.create({
      learnerGroups: resolve([])
    });

    this.set('subject', subject);
    this.set('click', function() {
      assert.ok(true);
    });

    await render(hbs`<CollapsedLearnergroups @subject={{subject}} @expand={{this.click}} />`);
    assert.equal(component.title, 'Learner Groups (0)');
    await component.expand();
  });
});
