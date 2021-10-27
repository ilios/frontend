import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/objective-list';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objective-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const vocabulary = this.server.create('vocabulary', { school });
    const term1 = this.server.create('term', { vocabulary });
    const term2 = this.server.create('term', { vocabulary });
    this.server.create('programYearObjective', {
      programYear,
      title: 'Objective A',
      position: 0,
      terms: [term1],
    });
    this.server.create('programYearObjective', {
      programYear,
      title: 'Objective B',
      position: 0,
      terms: [term2],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveList
        @editable={{true}}
        @programYear={{this.programYear}}
      />`
    );
    assert.ok(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.equal(component.headers[0].text, 'Description');
    assert.equal(component.headers[1].text, 'Competency');
    assert.equal(component.headers[2].text, 'Vocabulary Terms');
    assert.equal(component.headers[3].text, 'MeSH Terms');
    assert.equal(component.headers[4].text, 'Actions');

    assert.equal(component.objectives.length, 2);
    assert.equal(component.objectives[0].description.text, 'Objective B');
    assert.equal(component.objectives[0].selectedTerms.list[0].title, 'Vocabulary 1 (school 0)');
    assert.equal(component.objectives[0].selectedTerms.list[0].terms[0].name, 'term 1');
    assert.equal(component.objectives[1].description.text, 'Objective A');
    assert.equal(component.objectives[1].selectedTerms.list[0].title, 'Vocabulary 1 (school 0)');
    assert.equal(component.objectives[1].selectedTerms.list[0].terms[0].name, 'term 0');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('empty list', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveList
        @editable={{true}}
        @programYear={{this.programYear}}
      />`
    );
    assert.notOk(component.sortIsVisible);
    assert.equal(component.text, '');
  });

  test('no "sort objectives" button in list with one item', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    this.server.create('programYearObjective', { programYear, position: 0 });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveList
        @editable={{true}}
        @programYear={{this.programYear}}
      />`
    );
    assert.notOk(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.equal(component.objectives.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('all eligible domain trees are shown in competency picker', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const domain1 = this.server.create('competency', { school });
    const competency1 = this.server.create('competency', { school, parent: domain1 });
    const domain2 = this.server.create('competency', { school });
    this.server.createList('competency', 2, { school, parent: domain2 });
    const programYear = this.server.create('programYear', {
      program,
      competencies: [competency1, domain2],
    });
    this.server.create('programYearObjective', { programYear });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveList
        @editable={{true}}
        @programYear={{this.programYear}}
      />`
    );
    await component.objectives[0].competency.manage();
    assert.ok(component.objectives[0].competencyManager.domains.length, 2);
    assert.ok(component.objectives[0].competencyManager.domains[0].competencies.length, 1);
    assert.ok(component.objectives[0].competencyManager.domains[1].competencies.length, 2);
  });
});
