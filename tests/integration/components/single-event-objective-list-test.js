import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('single-event-objective-list', 'Integration | Component | ilios calendar single event objective list', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(18);

  const objectives = [
    {domain: 'great things', title: 'cheese', position: 1},
    {domain: 'great things', title: 'ice cream', position: 2},
    {domain: 'annoying things', title: 'buying gas', position: 3},
    {domain: 'annoying things', title: 'traffic', position: 4},
  ];

  const courseObjectivesPhrase = 'Course Objectives';
  const listByPriorityPhrase = 'List by Priority';
  const groupByCompetenciesPhrase = 'Group by Competencies';

  this.set('courseObjectivesPhrase', courseObjectivesPhrase);
  this.set('groupByCompetenciesPhrase', groupByCompetenciesPhrase);
  this.set('listByPriorityPhrase', listByPriorityPhrase);
  this.set('objectives', objectives);
  this.render(hbs`{{single-event-objective-list
    objectives=objectives
    groupByCompetenciesPhrase=groupByCompetenciesPhrase
    listByPriorityPhrase=listByPriorityPhrase
    title=courseObjectivesPhrase
  }}`);

  assert.equal(this.$('h2').text().trim(), courseObjectivesPhrase, 'Title is visible');
  assert.ok(this.$('ul.tree').length, 'Domains/Objectives tree is visible');
  assert.notOk(this.$('ul.list-in-order').length, 'Objectives list is not visible');
  assert.equal(this.$('ul:eq(0)>li:eq(0)').text().trim().search(/^annoying things/), 0);
  assert.equal(this.$('ul:eq(0)>li:eq(0)>ul>li:eq(1)').text().trim().search(/^traffic/), 0);
  assert.equal(this.$('ul:eq(0)>li:eq(1)').text().trim().search(/^great things/), 0);
  assert.equal(this.$('ul:eq(0)>li:eq(1)>ul>li:eq(0)').text().trim().search(/^cheese/), 0);
  assert.ok(this.$('h2 button').hasClass('active'), 'Display-mode button is visible and is "active"');
  this.$('h2 button').click();
  assert.notOk(this.$('ul.tree').length, 'Domains/Objectives tree is not visible');
  assert.ok(this.$('ul.list-in-order').length, 'Objectives list is visible');
  for(let i = 0, n = objectives.length; i < n; i++) {
    assert.equal(0, this.$(`.list-in-order li:eq(${i})`).text().trim().indexOf(objectives[i].title), 'Objective title is visible');
    assert.equal(this.$(`.list-in-order li:eq(${i}) .details`).text().trim(), objectives[i].domain, 'Domain is visible.');
  }
});

test('displays `None` when provided no content', function(assert) {
  assert.expect(1);

  this.set('objectives', []);
  this.render(hbs`{{single-event-objective-list
    objectives=objectives
  }}`);

  assert.equal(this.$('.no-content').text(), 'None');
});

test('no display mode toggle if none of the objectives are prioritized', function(assert) {
  assert.expect(3);

  const objectives = [
    {domain: 'great things', title: 'cheese', position: 0},
    {domain: 'great things', title: 'ice cream', position: 0},
    {domain: 'annoying things', title: 'buying gas', position: 0},
    {domain: 'annoying things', title: 'traffic', position: 0},
  ];

  const courseObjectivesPhrase = 'Course Objectives';
  this.set('courseObjectivesPhrase', courseObjectivesPhrase);
  this.set('objectives', objectives);
  this.render(hbs`{{single-event-objective-list
    objectives=objectives
    title=courseObjectivesPhrase
  }}`);

  assert.notOk(this.$('h2 button').hasClass('active'), 'Display-mode button is not visible');
  // briefly check if the component renders fine otherwise.
  assert.equal(this.$('h2').text().trim(), courseObjectivesPhrase, 'Title is visible');
  assert.ok(this.$('ul.tree').length, 'Domains/Objectives tree');
});
