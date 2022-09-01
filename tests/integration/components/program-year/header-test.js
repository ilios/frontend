import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/header';

module('Integration | Component | program-year/header', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      startYear: 2019,
    });
    this.server.create('cohort', {
      programYear,
      title: 'Lorem Ipsum',
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);
    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::Header @programYear={{this.programYear}} />`);
    assert.strictEqual(component.backToProgram.text, 'Back to Program Years');
    assert.notOk(component.isLocked);
    assert.strictEqual(component.matriculationYear, 'Matriculation Year 2019');
    assert.strictEqual(component.cohort, '(Lorem Ipsum)');
  });

  test('matriculation year shows as year-range based on application config', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      startYear: 2019,
    });
    this.server.create('cohort', {
      programYear,
      title: 'Lorem Ipsum',
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);
    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::Header @programYear={{this.programYear}} />`);
    assert.strictEqual(component.matriculationYear, 'Matriculation Year 2019 - 2020');
  });

  test('default cohort title', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      startYear: 2019,
    });
    this.server.create('cohort', {
      title: '',
      programYear,
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);
    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::Header @programYear={{this.programYear}} />`);
    assert.strictEqual(component.cohort, '(Class of 2023)');
  });

  test('locked', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      startYear: 2019,
      locked: true,
    });
    this.server.create('cohort', {
      programYear,
      title: 'Lorem Ipsum',
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);
    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::Header @programYear={{this.programYear}} />`);
    assert.ok(component.isLocked);
  });
});
