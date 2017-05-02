import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object:EmberObject } = Ember;
const { resolve } = RSVP;

moduleForComponent('course-objective-list', 'Integration | Component | course objective list', {
  integration: true
});

test('it renders', function(assert){
  assert.expect(7);

  let objective1 = EmberObject.create({
    title: 'Objective A',
    position: 0
  });

  let objective2 = EmberObject.create({
    title: 'Objective B',
    position: 0
  });

  let objectives = [ objective1, objective2 ];

  let course = EmberObject.create({
    sortedObjectives: resolve(objectives),
  });

  this.on('nothing', parseInt);
  this.set('subject', course);

  this.render(
    hbs`{{course-objective-list subject=subject manageParents=(action 'nothing') manageDescriptors=(action 'nothing')}}`
  );
  return wait().then(() => {
    assert.ok(this.$('.sort-materials-btn').length, 'Sort Objectives button is visible');
    assert.equal(this.$('thead th:eq(0)').text().trim(), 'Description');
    assert.equal(this.$('thead th:eq(1)').text().trim(), 'Parent Objectives');
    assert.equal(this.$('thead th:eq(2)').text().trim(), 'MeSH Terms');
    assert.equal(this.$('thead th:eq(3)').text().trim(), 'Actions');
    for (let i = 0, n = objectives.length; i < n; i++) {
      let objective = objectives[i];
      assert.equal(this.$(`tbody tr:eq(${i}) td:eq(0)`).text().trim(), objective.get('title'));
    }
  });
});

test('empty list', function(assert){
  assert.expect(2);
  let course = EmberObject.create({
    objectives: resolve([]),
  });
  this.set('subject', course);
  this.render(hbs`{{course-objective-list subject=subject}}`);
  return wait().then(() => {
    let container = this.$('.course-objective-list');
    assert.equal(container.length, 1, 'Component container element exists.');
    assert.equal(container.text().trim(), '', 'No content is shown.');
  });
});

test('no "sort objectives" button in list with one item', function(assert){
  assert.expect(2);
  let objective = EmberObject.create({
    title: 'Objective A',
  });
  let course = EmberObject.create({
    sortedObjectives: resolve([ objective ]),
  });

  this.on('nothing', parseInt);
  this.set('subject', course);

  this.render(
    hbs`{{course-objective-list subject=subject manageParents=(action 'nothing') manageDescriptors=(action 'nothing')}}`
  );

  return wait().then(() => {
    assert.notOk(this.$('.sort-materials-btn').length, 'Sort button is not visible');
    assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), objective.get('title'), 'Objective is visible');
  });
});

