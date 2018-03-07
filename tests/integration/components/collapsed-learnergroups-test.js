import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | collapsed learnergroups', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });



  test('displays summary data', async function(assert) {
    assert.expect(6);
    let cohort1 = EmberObject.create({
      id: '1',
      title: 'cohort 1',
      programYear: resolve(EmberObject.create({
        program: resolve(EmberObject.create({
          title: 'program 1'
        }))
      }))
    });
    let cohort2 = EmberObject.create({
      id: '2',
      title: 'cohort 2',
      programYear: resolve(EmberObject.create({
        program: resolve(EmberObject.create({
          title: 'program 2'
        }))
      }))
    });

    let learnerGroup1 = EmberObject.create({
      id: 1,
      cohort: resolve(cohort1)
    });
    let learnerGroup2 = EmberObject.create({
      id: 2,
      cohort: resolve(cohort1)
    });
    let learnerGroup3 = EmberObject.create({
      id: 3,
      cohort: resolve(cohort1)
    });
    let learnerGroup4 = EmberObject.create({
      id: 4,
      cohort: resolve(cohort2)
    });
    let learnerGroups = [learnerGroup1, learnerGroup2, learnerGroup3, learnerGroup4];

    const subject = EmberObject.create({
      learnerGroups: resolve(learnerGroups)
    });

    this.set('subject', subject);
    this.set('nothing', parseInt);
    await render(hbs`{{collapsed-learnergroups subject=subject expand=(action nothing)}}`);
    await settled();
    assert.equal(find('.title').textContent.trim(), 'Learner Groups (4)');
    assert.equal(findAll('table tr').length, 3);
    assert.equal(find('tr:eq(1) td').textContent.trim(), 'program 1 cohort 1');
    assert.equal(find('tr:eq(2) td').textContent.trim(), 'program 2 cohort 2');
    assert.equal(find(findAll('tr:eq(1) td')[1]).textContent.trim(), '3');
    assert.equal(find(findAll('tr:eq(2) td')[1]).textContent.trim(), '1');


  });

  test('clicking expand icon opens full view', async function(assert) {
    assert.expect(2);

    const subject = EmberObject.create({
      learnerGroups: resolve([])
    });

    this.set('subject', subject);
    this.actions.click = function() {
      assert.ok(true);
    };

    await render(hbs`{{collapsed-learnergroups subject=subject expand=(action 'click')}}`);

    assert.equal(find('.title').textContent.trim(), 'Learner Groups (0)');
    await click('.title');
  });
});
