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
    const domain = this.server.create('competency', { title: 'domain 0' });
    const competency = this.server.create('competency', { title: 'competency 0', parent: domain });
    this.domainModel = await this.owner.lookup('service:store').find('competency', domain.id);
    this.competencyModel = await this.owner
      .lookup('service:store')
      .find('competency', competency.id);
  });

  test('it renders and is accessible', async function (assert) {
    const domainTrees = [
      {
        title: this.domainModel.title,
        id: this.domainModel.id,
        competencies: [
          {
            id: this.competencyModel.id,
            title: this.competencyModel.title,
          },
        ],
      },
    ];
    this.set('domainTrees', domainTrees);
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @domainTrees={{this.domainTrees}}
      @selected={{null}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.equal(component.domains.length, 1);
    assert.equal(component.domains[0].title, this.domainModel.title);
    assert.ok(component.domains[0].notSelected);

    assert.equal(component.domains[0].competencies.length, 1);
    assert.equal(component.domains[0].competencies[0].title, this.competencyModel.title);
    assert.ok(component.domains[0].competencies[0].notSelected);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('unselect domain', async function (assert) {
    assert.expect(2);
    const domainTrees = [
      {
        title: this.domainModel.title,
        id: this.domainModel.id,
        competencies: [],
      },
    ];
    this.set('selected', this.domainModel);
    this.set('domainTrees', domainTrees);
    this.set('remove', () => {
      assert.ok(true); // input doesn't matter, we just need to confirm this fired.
    });
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @domainTrees={{this.domainTrees}}
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
        title: this.domainModel.title,
        id: this.domainModel.id,
        competencies: [],
      },
    ];
    this.set('domainTrees', domainTrees);
    this.set('add', (id) => {
      assert.equal(id, this.domainModel.id);
    });
    await render(hbs`<ProgramYear::ManageObjectiveCompetency
      @domainTrees={{this.domainTrees}}
      @selected={{null}}
      @add={{this.add}}
      @remove={{(noop)}}
    />`);
    assert.ok(component.domains[0].notSelected);
    await component.domains[0].toggle();
  });
});
