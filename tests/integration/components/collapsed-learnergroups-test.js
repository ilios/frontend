import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
const { resolve } = RSVP;

moduleForComponent('collapsed-learnergroups', 'Integration | Component | collapsed learnergroups', {
  integration: true
});



test('displays summary data', function(assert) {
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
  this.render(hbs`{{collapsed-learnergroups subject=subject expand=(action nothing)}}`);
  assert.equal(this.$('.title').text().trim(), 'Learner Groups (4)');
  assert.equal(this.$('table tr').length, 3);
  assert.equal(this.$('tr:eq(1) td:eq(0)').text().trim(), 'program 1 cohort 1');
  assert.equal(this.$('tr:eq(2) td:eq(0)').text().trim(), 'program 2 cohort 2');
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), '3');
  assert.equal(this.$('tr:eq(2) td:eq(1)').text().trim(), '1');


});

test('clicking expand icon opens full view', function(assert) {
  assert.expect(2);

  const subject = EmberObject.create({
    learnerGroups: resolve([])
  });

  this.set('subject', subject);
  this.on('click', function() {
    assert.ok(true);
  });

  this.render(hbs`{{collapsed-learnergroups subject=subject expand=(action 'click')}}`);

  assert.equal(this.$('.title').text().trim(), 'Learner Groups (0)');
  this.$('.title').click();
});
