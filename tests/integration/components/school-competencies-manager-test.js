import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-competencies-manager';

module('Integration | Component | school competencies manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const programYearObjectives = this.server.createList('programYearObjective', 3);
    const competency1 = this.server.create('competency', {
      title: 'competency1',
      programYearObjectives,
    });
    const competency2 = this.server.create('competency', { title: 'competency2' });
    const domain = this.server.create('competency', {
      title: 'domain1',
      children: [competency1, competency2],
    });
    const domainModel = await this.owner.lookup('service:store').find('competency', domain.id);
    const competencyModel1 = await this.owner
      .lookup('service:store')
      .find('competency', competency1.id);
    const competencyModel2 = await this.owner
      .lookup('service:store')
      .find('competency', competency2.id);
    const competencies = [domainModel, competencyModel1, competencyModel2];

    this.set('competencies', competencies);
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{(noop)}}
      @remove={{(noop)}}
      @competencies={{this.competencies}}
    />`);

    assert.equal(component.domains.length, 1);
    assert.equal(component.domains[0].details.editor.text, 'domain1');
    assert.equal(component.domains[0].competencies.length, 2);
    assert.equal(component.domains[0].competencies[0].editor.text, 'competency1');
    assert.equal(component.domains[0].competencies[0].objectivesCount, '(3)');
    assert.equal(component.domains[0].competencies[1].editor.text, 'competency2');
    assert.equal(component.domains[0].competencies[1].objectivesCount, '(0)');
    assert.notOk(component.domains[0].isRemovable);
    assert.notOk(component.domains[0].competencies[0].isRemovable);
    assert.ok(component.domains[0].competencies[1].isRemovable);
  });

  test('delete domain', async function (assert) {
    assert.expect(1);
    const domain = this.server.create('competency', { title: 'domain1' });
    const domainModel = await this.owner.lookup('service:store').find('competency', domain.id);
    const competencies = [domainModel];

    this.set('competencies', competencies);
    this.set('remove', (what) => {
      assert.equal(what, domainModel);
    });
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{(noop)}}
      @remove={{this.remove}}
      @competencies={{this.competencies}}
    />`);

    await component.domains[0].remove();
  });

  test('add domain', async function (assert) {
    assert.expect(2);
    const newTitle = 'new c';
    const domain = this.server.create('competency', { title: 'domain1' });
    const domainModel = await this.owner.lookup('service:store').find('competency', domain.id);
    const competencies = [domainModel];

    this.set('competencies', competencies);
    this.set('add', (what, title) => {
      assert.equal(what, null);
      assert.equal(title, newTitle);
    });
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{this.add}}
      @remove={{(noop)}}
      @competencies={{this.competencies}}
    />`);

    await component.newDomain.newCompetency.title.set(newTitle);
    await component.newDomain.newCompetency.save();
  });

  test('add competency', async function (assert) {
    assert.expect(2);
    const newTitle = 'new c';
    const domain = this.server.create('competency', { title: 'domain1' });
    const domainModel = await this.owner.lookup('service:store').find('competency', domain.id);
    const competencies = [domainModel];

    this.set('competencies', competencies);
    this.set('add', (what, title) => {
      assert.equal(what, domainModel);
      assert.equal(title, newTitle);
    });
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{this.add}}
      @remove={{(noop)}}
      @competencies={{this.competencies}}
    />`);

    await component.domains[0].newCompetency.title.set(newTitle);
    await component.domains[0].newCompetency.save();
  });
});
