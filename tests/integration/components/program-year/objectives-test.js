import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/objectives';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objectives', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible with a single cohort', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const domains = this.server.createList('competency', 2, { school });

    const competencies = this.server.createList('competency', 2, { school, parent: domains[0] });
    this.server.createList('competency', 2, { school, parent: domains[1] });

    this.server.create('objective', {
      competency: competencies[0],
      programYears: [programYear]
    });
    this.server.create('objective', {
      programYears: [programYear]
    });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::Objectives
      @programYear={{this.programYear}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.current.length, 2);
    assert.equal(component.current[0].description.text, 'objective 0');
    assert.ok(component.current[0].hasCompetency);
    assert.equal(component.current[0].competencyTitle, 'competency 2');
    assert.equal(component.current[0].domainTitle, '(competency 0)');
    assert.equal(component.current[0].meshTerms.length, 0);

    assert.equal(component.current[1].description.text, 'objective 1');
    assert.notOk(component.current[1].hasCompetency);
    assert.equal(component.current[1].meshTerms.length, 0);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it loads data for a school domains', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const domains = this.server.createList('competency', 2, { school });

    const competencies = this.server.createList('competency', 3, { school, parent: domains[0] });
    this.server.createList('competency', 2, { school, parent: domains[1] });

    this.server.create('objective', {
      competency: competencies[0],
      programYears: [programYear]
    });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::Objectives
      @programYear={{this.programYear}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.current.length, 1);
    assert.equal(component.current[0].description.text, 'objective 0');
    assert.ok(component.current[0].hasCompetency);
    await component.current[0].manageCompetency();
    const m = component.manageObjectiveCompetency;
    assert.equal(m.objectiveTitle, 'objective 0');

    assert.equal(m.domains.length, 2);

    assert.equal(m.domains[0].title, 'competency 0');
    assert.ok(m.domains[0].selected);
    assert.equal(m.domains[0].competencies.length, 3);
    assert.equal(m.domains[0].competencies[0].title, 'competency 2');
    assert.ok(m.domains[0].competencies[0].selected);
    assert.equal(m.domains[0].competencies[1].title, 'competency 3');
    assert.ok(m.domains[0].competencies[1].notSelected);
    assert.equal(m.domains[0].competencies[2].title, 'competency 4');
    assert.ok(m.domains[0].competencies[2].notSelected);

    assert.equal(m.domains[1].title, 'competency 1');
    assert.ok(m.domains[1].notSelected);
    assert.equal(m.domains[1].competencies.length, 2);
    assert.equal(m.domains[1].competencies[0].title, 'competency 5');
    assert.ok(m.domains[1].competencies[0].notSelected);
    assert.equal(m.domains[1].competencies[1].title, 'competency 6');
    assert.ok(m.domains[1].competencies[1].notSelected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
