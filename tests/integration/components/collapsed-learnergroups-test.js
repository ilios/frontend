import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  findAll
} from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('Integration | Component | collapsed learnergroups', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('displays summary data', async function(assert) {
    assert.expect(6);
    let cohorts = [];
    for (let i = 1; i <= 2; i++) {
      const program = this.server.create('program');
      const programYear = this.server.create('program-year', { program });
      cohorts.pushObject(this.server.create('cohort', { programYear }));
    }
    this.server.create('learner-group', { cohort: cohorts[0] });
    this.server.create('learner-group', { cohort: cohorts[0] });
    this.server.create('learner-group', { cohort: cohorts[0] });
    this.server.create('learner-group', { cohort: cohorts[1] });

    const learnerGroups = await run(() => this.owner.lookup('service:store').findAll('learner-group'));
    const subject = EmberObject.create({
      learnerGroups: resolve(learnerGroups)
    });

    this.set('subject', subject);
    this.set('nothing', parseInt);
    await render(hbs`{{collapsed-learnergroups subject=subject expand=(action nothing)}}`);
    await settled();
    assert.dom('.title').hasText('Learner Groups (4)');
    assert.dom('table tr').exists({ count: 3 });
    assert.dom(findAll('tr:nth-of-type(1) td')[0]).hasText('program 0 cohort 0');
    assert.dom(findAll('tr:nth-of-type(2) td')[0]).hasText('program 1 cohort 1');
    assert.dom(findAll('tr:nth-of-type(1) td')[1]).hasText('3');
    assert.dom(findAll('tr:nth-of-type(2) td')[1]).hasText('1');

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

    await render(hbs`{{collapsed-learnergroups subject=subject expand=(action click)}}`);

    assert.dom('.title').hasText('Learner Groups (0)');
    await click('.title');
  });
});
