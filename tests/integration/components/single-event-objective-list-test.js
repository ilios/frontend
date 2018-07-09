import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios calendar single event objective list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
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
    await render(hbs`{{single-event-objective-list
      objectives=objectives
      groupByCompetenciesPhrase=groupByCompetenciesPhrase
      listByPriorityPhrase=listByPriorityPhrase
      title=courseObjectivesPhrase
    }}`);


    assert.dom(this.element.querySelector('h2')).hasText(courseObjectivesPhrase, 'Title is visible');
    assert.ok(this.element.querySelectorAll('ul.tree').length, 'Domains/Objectives tree is visible');
    assert.notOk(this.element.querySelectorAll('ul.list-in-order').length, 'Objectives list is not visible');
    assert.equal(this.element.querySelector('ul.tree>li').textContent.trim().search(/^annoying things/), 0);
    assert.equal(this.element.querySelector('ul.tree>li:nth-of-type(1)>ul>li:nth-of-type(2)').textContent.trim().search(/^traffic/), 0);
    assert.equal(this.element.querySelector('ul.tree>li:nth-of-type(2)').textContent.trim().search(/^great things/), 0);
    assert.equal(this.element.querySelector('ul.tree>li:nth-of-type(2)>ul>li').textContent.trim().search(/^cheese/), 0);
    assert.dom(this.element.querySelector('h2 button')).hasClass('active', 'Display-mode button is visible and is "active"');
    await click('h2 button');

    assert.notOk(this.element.querySelectorAll('ul.tree').length, 'Domains/Objectives tree is not visible');
    assert.ok(this.element.querySelectorAll('ul.list-in-order').length, 'Objectives list is visible');
    for(let i = 0, n = objectives.length; i < n; i++) {
      assert.equal(0, this.$(`.list-in-order li:nth-of-type(${i + 1})`).text().trim().indexOf(objectives[i].title), 'Objective title is visible');
      assert.equal(this.$(`.list-in-order li:nth-of-type(${i + 1}) .details`).text().trim(), objectives[i].domain, 'Domain is visible.');
    }
  });

  test('displays `None` when provided no content', async function(assert) {
    assert.expect(1);

    this.set('objectives', []);
    await render(hbs`{{single-event-objective-list
      objectives=objectives
    }}`);

    assert.dom(this.element.querySelector('.no-content')).hasText('None');
  });

  test('no display mode toggle if none of the objectives are prioritized', async function(assert) {
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
    await render(hbs`{{single-event-objective-list
      objectives=objectives
      title=courseObjectivesPhrase
    }}`);

    const h2 = this.element.querySelector('h2');
    assert.equal(h2.querySelectorAll('button').length, 0, 'Display-mode button is not visible');
    // briefly check if the component renders fine otherwise.
    assert.dom(h2).hasText(courseObjectivesPhrase, 'Title is visible');
    assert.ok(this.element.querySelectorAll('ul.tree').length, 'Domains/Objectives tree');
  });
});
