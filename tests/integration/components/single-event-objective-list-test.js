import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/single-event-objective-list';

module('Integration | Component | ilios calendar single event objective list', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const objectives = [
      { domain: 'great things', title: 'cheese', position: 1 },
      { domain: 'great things', title: 'ice cream', position: 2 },
      { domain: 'annoying things', title: 'buying gas', position: 3 },
      { domain: 'annoying things', title: 'traffic', position: 4 },
    ];
    const title = 'Course Objectives';
    const listByPriorityPhrase = 'List by Priority';
    const groupByCompetenciesPhrase = 'Group by Competencies';
    this.set('title', title);
    this.set('groupByCompetenciesPhrase', groupByCompetenciesPhrase);
    this.set('listByPriorityPhrase', listByPriorityPhrase);
    this.set('objectives', objectives);

    await render(hbs`<SingleEventObjectiveList
      @objectives={{this.objectives}}
      @groupByCompetenciesPhrase={{this.groupByCompetenciesPhrase}}
      @listByPriorityPhrase={{this.listByPriorityPhrase}}
      @title={{this.title}}
      @isExpandedByDefault={{true}}
    />`);

    assert.strictEqual(component.title.expandCollapseSwitcher.text, title);
    assert.ok(component.title.expandCollapseSwitcher.isExpanded);
    assert.strictEqual(component.title.displayModeSwitcher.text, listByPriorityPhrase);
    assert.ok(component.title.displayModeSwitcher.isListMode);
    assert.ok(component.tree.isVisible);
    assert.notOk(component.list.isVisible);
    assert.strictEqual(component.tree.domains.length, 2);
    assert.strictEqual(component.tree.domains[0].title, 'annoying things');
    assert.strictEqual(component.tree.domains[0].objectives.length, 2);
    assert.strictEqual(component.tree.domains[0].objectives[0].text, 'buying gas');
    assert.strictEqual(component.tree.domains[0].objectives[1].text, 'traffic');
    assert.strictEqual(component.tree.domains[1].title, 'great things');
    assert.strictEqual(component.tree.domains[1].objectives[0].text, 'cheese');
    assert.strictEqual(component.tree.domains[1].objectives[1].text, 'ice cream');
    assert.notOk(component.noContent.isVisible);

    await component.title.displayModeSwitcher.toggle();

    assert.strictEqual(component.title.displayModeSwitcher.text, groupByCompetenciesPhrase);
    assert.notOk(component.title.displayModeSwitcher.isListMode);
    assert.notOk(component.tree.isVisible);
    assert.ok(component.list.isVisible);
    assert.strictEqual(component.list.objectives.length, 4);
    assert.strictEqual(component.list.objectives[0].title, 'cheese');
    assert.strictEqual(component.list.objectives[0].domain, 'great things');
    assert.strictEqual(component.list.objectives[1].title, 'ice cream');
    assert.strictEqual(component.list.objectives[1].domain, 'great things');
    assert.strictEqual(component.list.objectives[2].title, 'buying gas');
    assert.strictEqual(component.list.objectives[2].domain, 'annoying things');
    assert.strictEqual(component.list.objectives[3].title, 'traffic');
    assert.strictEqual(component.list.objectives[3].domain, 'annoying things');
    assert.notOk(component.list.noContent.isVisible);
  });

  test('displays `None` when provided no content', async function (assert) {
    this.set('objectives', []);

    await render(hbs`<SingleEventObjectiveList
      @objectives={{this.objectives}}
      @isExpandedByDefault={{true}}
    />`);
    assert.strictEqual(component.noContent.text, 'None');
  });

  test('no display mode toggle if none of the objectives are prioritized', async function (assert) {
    const objectives = [
      { domain: 'great things', title: 'cheese', position: 0 },
      { domain: 'great things', title: 'ice cream', position: 0 },
      { domain: 'annoying things', title: 'buying gas', position: 0 },
      { domain: 'annoying things', title: 'traffic', position: 0 },
    ];

    this.set('objectives', objectives);
    await render(hbs`<SingleEventObjectiveList
      @objectives={{this.objectives}}
      @isExpandedByDefault={{true}}
    />`);

    assert.notOk(component.title.displayModeSwitcher.isVisible);
    assert.ok(component.tree.domains.length, 2);
  });

  test('collapsed by default', async function (assert) {
    const objectives = [
      { domain: 'great things', title: 'cheese', position: 1 },
      { domain: 'great things', title: 'ice cream', position: 2 },
      { domain: 'annoying things', title: 'buying gas', position: 3 },
      { domain: 'annoying things', title: 'traffic', position: 4 },
    ];
    this.set('objectives', objectives);

    await render(hbs`<SingleEventObjectiveList
      @objectives={{this.objectives}}
      @isExpandedByDefault={{false}}
    />`);

    assert.notOk(component.title.expandCollapseSwitcher.isExpanded);
    assert.ok(component.title.displayModeSwitcher.isDisabled);
    assert.notOk(component.tree.isVisible);
    assert.notOk(component.noContent.isVisible);
    assert.notOk(component.list.isVisible);
  });
});
