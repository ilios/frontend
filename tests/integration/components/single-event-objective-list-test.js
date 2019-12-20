import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios calendar single event objective list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(20);

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
    await render(hbs`<SingleEventObjectiveList
      @objectives={{this.objectives}}
      @groupByCompetenciesPhrase={{this.groupByCompetenciesPhrase}}
      @listByPriorityPhrase={{this.listByPriorityPhrase}}
      @title={{this.courseObjectivesPhrase}}
    />`);

    assert.dom('h2').containsText(courseObjectivesPhrase, 'Title is visible');
    assert.dom('ul.tree').exists('Domains/Objectives tree is visible');
    assert.dom('ul.list-in-order').doesNotExist('Objectives list is not visible');
    assert.dom('ul.tree>li').hasText('annoying things buying gas traffic');
    assert.dom('ul.tree>li:nth-of-type(1)>ul>li:nth-of-type(1)').hasText('buying gas');
    assert.dom('ul.tree>li:nth-of-type(1)>ul>li:nth-of-type(2)').hasText('traffic');
    assert.dom('ul.tree>li:nth-of-type(2)').hasText('great things cheese ice cream');
    assert.dom('ul.tree>li:nth-of-type(2)>ul>li:nth-of-type(1)').hasText('cheese');
    assert.dom('ul.tree>li:nth-of-type(2)>ul>li:nth-of-type(2)').hasText('ice cream');
    assert.dom('h2 button').hasClass('active', 'Display-mode button is visible and is "active"');
    await click('h2 button');

    assert.dom('ul.tree').doesNotExist('Domains/Objectives tree is not visible');
    assert.dom('ul.list-in-order').exists('Objectives list is visible');
    for(let i = 0, n = objectives.length; i < n; i++) {
      assert.dom(`.list-in-order li:nth-of-type(${i + 1})`)
        .hasText(`${objectives[i].title} ${objectives[i].domain}`, 'Objective title is visible');
      assert.dom(`.list-in-order li:nth-of-type(${i + 1}) .details`)
        .hasText(objectives[i].domain, 'Domain is visible.');
    }
  });

  test('displays `None` when provided no content', async function(assert) {
    assert.expect(1);

    this.set('objectives', []);
    await render(hbs`<SingleEventObjectiveList @objectives={{this.objectives}} />`);

    assert.dom('.no-content').hasText('None');
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
    await render(hbs`<SingleEventObjectiveList
      @objectives={{this.objectives}}
      @title={{this.courseObjectivesPhrase}}
    />`);

    assert.dom('h2 button').doesNotExist('Display-mode button is not visible');
    // briefly check if the component renders fine otherwise.
    assert.dom('h2').hasText(courseObjectivesPhrase, 'Title is visible');
    assert.dom('ul.tree').exists('Domains/Objectives tree is visible');
  });
});
