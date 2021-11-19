import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | program-year/header', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);
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
    this.set('canUpdate', true);

    await render(
      hbs`<ProgramYear::Header @programYear={{this.programYear}} @canUpdate={{this.canUpdate}} />`
    );
    assert.dom('.backtolink').hasText('Back to Program Years');
    assert.dom('header .fa-lock').doesNotExist();
    assert.dom('header .title').hasText('Matriculation Year 2019 Lorem Ipsum');
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
    this.set('canUpdate', true);

    await render(
      hbs`<ProgramYear::Header @programYear={{this.programYear}} @canUpdate={{this.canUpdate}} />`
    );

    assert.dom('header .title').hasText('Matriculation Year 2019 - 2020 Lorem Ipsum');
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
    this.set('canUpdate', true);

    await render(
      hbs`<ProgramYear::Header @programYear={{this.programYear}} @canUpdate={{this.canUpdate}} />`
    );
    assert.dom('header .title').hasText('Matriculation Year 2019 Class of 2023');
  });

  test('read-only', async function (assert) {
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
      programYear,
      title: 'Lorem Ipsum',
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    this.set('canUpdate', false);

    await render(
      hbs`<ProgramYear::Header @programYear={{this.programYear}} @canUpdate={{this.canUpdate}} />`
    );
    assert.dom('.programyear-publication button').doesNotExist();
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
    this.set('canUpdate', false);

    await render(
      hbs`<ProgramYear::Header @programYear={{this.programYear}} @canUpdate={{this.canUpdate}} />`
    );
    assert.dom('header .fa-lock').exists();
  });
});
