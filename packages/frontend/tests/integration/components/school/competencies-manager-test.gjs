import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school/competencies-manager';
import CompetenciesManager from 'frontend/components/school/competencies-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school/competencies-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const programYearObjectives = this.server.createList('program-year-objective', 3);
    const competency1 = this.server.create('competency', {
      title: 'competency1',
      programYearObjectives,
    });
    const competency2 = this.server.create('competency', { title: 'competency2' });
    const domain = this.server.create('competency', {
      title: 'domain1',
      children: [competency1, competency2],
    });
    const domainModel = await this.owner
      .lookup('service:store')
      .findRecord('competency', domain.id);
    const competencyModel1 = await this.owner
      .lookup('service:store')
      .findRecord('competency', competency1.id);
    const competencyModel2 = await this.owner
      .lookup('service:store')
      .findRecord('competency', competency2.id);
    const competencies = [domainModel, competencyModel1, competencyModel2];

    this.set('competencies', competencies);
    await render(
      <template>
        <CompetenciesManager
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
          @add={{(noop)}}
          @remove={{(noop)}}
          @competencies={{this.competencies}}
        />
      </template>,
    );

    assert.strictEqual(component.domains.length, 1);
    assert.strictEqual(component.domains[0].details.editor.text, 'domain1');
    assert.strictEqual(component.domains[0].competencies.length, 2);
    assert.strictEqual(component.domains[0].competencies[0].editor.text, 'competency1');
    assert.strictEqual(component.domains[0].competencies[1].editor.text, 'competency2');
    assert.notOk(component.domains[0].isRemovable);
    assert.notOk(component.domains[0].competencies[0].isRemovable);
    assert.ok(component.domains[0].competencies[1].isRemovable);
  });

  test('delete domain', async function (assert) {
    const domain = this.server.create('competency', { title: 'domain1' });
    const domainModel = await this.owner
      .lookup('service:store')
      .findRecord('competency', domain.id);
    const competencies = [domainModel];

    this.set('competencies', competencies);
    this.set('remove', (what) => {
      assert.step('remove called');
      assert.strictEqual(what, domainModel);
    });
    await render(
      <template>
        <CompetenciesManager
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
          @add={{(noop)}}
          @remove={{this.remove}}
          @competencies={{this.competencies}}
        />
      </template>,
    );

    await component.domains[0].remove();
    assert.verifySteps(['remove called']);
  });

  test('add domain', async function (assert) {
    const newTitle = 'new c';
    const domain = this.server.create('competency', { title: 'domain1' });
    const domainModel = await this.owner
      .lookup('service:store')
      .findRecord('competency', domain.id);
    const competencies = [domainModel];

    this.set('competencies', competencies);
    this.set('add', (what, title) => {
      assert.step('add called');
      assert.strictEqual(what, null);
      assert.strictEqual(title, newTitle);
    });
    await render(
      <template>
        <CompetenciesManager
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
          @add={{this.add}}
          @remove={{(noop)}}
          @competencies={{this.competencies}}
        />
      </template>,
    );

    await component.newDomain.newCompetency.title.set(newTitle);
    await component.newDomain.newCompetency.save();
    assert.verifySteps(['add called']);
  });

  test('add competency', async function (assert) {
    const newTitle = 'new c';
    const domain = this.server.create('competency', { title: 'domain1' });
    const domainModel = await this.owner
      .lookup('service:store')
      .findRecord('competency', domain.id);
    const competencies = [domainModel];

    this.set('competencies', competencies);
    this.set('add', (what, title) => {
      assert.step('add called');
      assert.strictEqual(what, domainModel);
      assert.strictEqual(title, newTitle);
    });
    await render(
      <template>
        <CompetenciesManager
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
          @add={{this.add}}
          @remove={{(noop)}}
          @competencies={{this.competencies}}
        />
      </template>,
    );

    await component.domains[0].newCompetency.title.set(newTitle);
    await component.domains[0].newCompetency.save();
    assert.verifySteps(['add called']);
  });
});
