import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/manage-objective-competency';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/manage-objective-competency', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const domain1 = this.server.create('competency', { title: 'Domain B' });
    const competency1 = this.server.create('competency', {
      title: 'competency 0',
      parent: domain1,
    });
    const domain2 = this.server.create('competency', { title: 'Domain A' });
    this.domainModel1 = await this.owner.lookup('service:store').find('competency', domain1.id);
    this.domainModel2 = await this.owner.lookup('service:store').find('competency', domain2.id);
    this.competencyModel1 = await this.owner
      .lookup('service:store')
      .find('competency', competency1.id);
  });

  test('it renders and is accessible', async function (assert) {
    const domainTrees = [
      {
        title: this.domainModel1.title,
        id: this.domainModel1.id,
        competencies: [
          {
            id: this.competencyModel1.id,
            title: this.competencyModel1.title,
          },
        ],
      },
    ];
    this.set('domainTrees', domainTrees);
    this.set('programYearCompetencies', [this.domainModel1, this.competencyModel1]);
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @domainTrees={{this.domainTrees}}
      @programYearCompetencies={{this.programYearCompetencies}}
      @selected={{null}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);
    assert.equal(component.domains.length, 1);
    assert.equal(component.domains[0].title, this.domainModel1.title);
    assert.ok(component.domains[0].notSelected);

    assert.equal(component.domains[0].competencies.length, 1);
    assert.equal(component.domains[0].competencies[0].title, this.competencyModel1.title);
    assert.ok(component.domains[0].competencies[0].notSelected);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('unselect domain', async function (assert) {
    assert.expect(2);
    const domainTrees = [
      {
        title: this.domainModel1.title,
        id: this.domainModel1.id,
        competencies: [],
      },
    ];
    this.set('selected', this.domainModel1);
    this.set('domainTrees', domainTrees);
    this.set('programYearCompetencies', [this.domainModel1]);
    this.set('remove', () => {
      assert.ok(true); // input doesn't matter, we just need to confirm this fired.
    });
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @domainTrees={{this.domainTrees}}
      @programYearCompetencies={{this.programYearCompetencies}}
      @selected={{this.selected}}
      @add={{(noop)}}
      @remove={{this.remove}}
    />`);
    assert.ok(component.domains[0].selected);
    await component.domains[0].toggle();
  });

  test('select domain', async function (assert) {
    assert.expect(2);
    const domainTrees = [
      {
        title: this.domainModel1.title,
        id: this.domainModel1.id,
        competencies: [],
      },
    ];
    this.set('domainTrees', domainTrees);
    this.set('programYearCompetencies', [this.domainModel1]);
    this.set('add', (id) => {
      assert.equal(id, this.domainModel1.id);
    });
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @domainTrees={{this.domainTrees}}
      @programYearCompetencies={{this.programYearCompetencies}}
      @selected={{null}}
      @add={{this.add}}
      @remove={{(noop)}}
    />`);
    assert.ok(component.domains[0].notSelected);
    await component.domains[0].toggle();
  });

  test('domains are sorted alphabetically by title', async function (assert) {
    const domainTrees = [
      {
        title: this.domainModel1.title,
        id: this.domainModel1.id,
        competencies: [],
      },
      {
        title: this.domainModel2.title,
        id: this.domainModel2.id,
        competencies: [],
      },
    ];
    this.set('domainTrees', domainTrees);
    this.set('programYearCompetencies', [this.domainModel1, this.domainModel2]);
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @domainTrees={{this.domainTrees}}
      @programYearCompetencies={{this.programYearCompetencies}}
      @selected={{null}}
      @add={{noop}}
      @remove={{(noop)}}
    />`);
    assert.equal(component.domains[0].title, this.domainModel2.title);
    assert.equal(component.domains[1].title, this.domainModel1.title);
  });

  test('unlinked, but selected domain can be unassigned but not assigned again', async function (assert) {
    const domainTrees = [
      {
        title: this.domainModel1.title,
        id: this.domainModel1.id,
        competencies: [
          {
            id: this.competencyModel1.id,
            title: this.competencyModel1.title,
          },
        ],
      },
    ];
    this.set('domainTrees', domainTrees);
    this.set('selected', this.domainModel1);
    this.set('programYearCompetencies', [this.domainModel1, this.competencyModel1]);
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @domainTrees={{this.domainTrees}}
      @programYearCompetencies={{this.programYearCompetencies}}
      @selected={{this.selected}}
      @add={{noop}}
      @remove={{(noop)}}
    />`);
    assert.ok(component.domains[0].selected);
    await component.domains[0].toggle();
    assert.notOk(component.domains[0].selectable);
  });

  test('unlinked, but selected competency can be unassigned but not assigned again', async function (assert) {
    const domainTrees = [
      {
        title: this.domainModel1.title,
        id: this.domainModel1.id,
        competencies: [
          {
            id: this.competencyModel1.id,
            title: this.competencyModel1.title,
          },
        ],
      },
    ];
    this.set('domainTrees', domainTrees);
    this.set('selected', this.competencyModel1);
    this.set('programYearCompetencies', [this.domainModel1, this.competencyModel1]);
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @domainTrees={{this.domainTrees}}
      @programYearCompetencies={{this.programYearCompetencies}}
      @selected={{this.selected}}
      @add={{noop}}
      @remove={{(noop)}}
    />`);
    assert.ok(component.domains[0].competencies[0].selected);
    await component.domains[0].competencies[0].toggle();
    assert.notOk(component.domains[0].competencies[0].selectable);
  });
});
