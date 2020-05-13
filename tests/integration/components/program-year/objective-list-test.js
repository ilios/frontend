import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/objective-list';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objective-list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function(assert) {
    assert.expect(14);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const vocabulary = this.server.create('vocabulary', { school });
    const term1 = this.server.create('term', { vocabulary });
    const term2 = this.server.create('term', { vocabulary });
    const objective1 = this.server.create('objective', {
      title: 'Objective A',
    });
    this.server.create('program-year-objective', {
      programYear,
      objective: objective1,
      position: 0,
      terms: [ term1 ]
    });
    const objective2 = this.server.create('objective', {
      title: 'Objective B',
    });
    this.server.create('program-year-objective', {
      programYear,
      objective: objective2,
      position: 0,
      terms: [ term2 ]
    });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);
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

  test('empty list', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);
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

  test('no "sort objectives" button in list with one item', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const objective = this.server.create('objective');
    this.server.create('program-year-objective', { programYear, objective, position: 0 });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);
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
});
