import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | programyear header', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      startYear: 2019,
      published: false,
      publishedAsTbd: false
    });
    this.server.create('cohort', {
      programYear,
      title: 'Lorem Ipsum'

    });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    this.set('canUpdate', true);

    await render(hbs`<ProgramyearHeader @programYear={{programYear}} @canUpdate={{canUpdate}} />`);
    assert.dom('.backtolink').hasText('Back to Program Years');
    assert.dom('header .fa-lock').doesNotExist();
    assert.dom('header .title').hasText('Matriculation Year 2019 - 2020 Lorem Ipsum');
    assert.dom('.programyear-publication button').exists();
  });

  test('default cohort title', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      startYear: 2019,
      published: false,
      publishedAsTbd: false
    });
    this.server.create('cohort', {
      title: '',
      programYear,
    });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    this.set('canUpdate', true);

    await render(hbs`<ProgramyearHeader @programYear={{programYear}} @canUpdate={{canUpdate}} />`);
    assert.dom('header .title').hasText('Matriculation Year 2019 - 2020 Class of 2023');
    assert.dom('.programyear-publication button').exists();
  });

  test('read-only', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      startYear: 2019,
      published: false,
      publishedAsTbd: false

    });
    this.server.create('cohort', {
      programYear,
      title: 'Lorem Ipsum'

    });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    this.set('canUpdate', false);

    await render(hbs`<ProgramyearHeader @programYear={{programYear}} @canUpdate={{canUpdate}} />`);
    assert.dom('.programyear-publication button').doesNotExist();
  });

  test('locked', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      startYear: 2019,
      published: false,
      publishedAsTbd: false,
      locked: true,

    });
    this.server.create('cohort', {
      programYear,
      title: 'Lorem Ipsum'

    });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    this.set('canUpdate', false);

    await render(hbs`<ProgramyearHeader @programYear={{programYear}} @canUpdate={{canUpdate}} />`);
    assert.dom('header .fa-lock').exists();
  });

  test('activate', async function(assert) {
    assert.expect(4);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      startYear: 2019,
      published: false,
      publishedAsTbd: true,
    });
    this.server.create('cohort', {
      programYear,
      title: 'Lorem Ipsum'

    });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    this.set('canUpdate', true);

    await render(hbs`<ProgramyearHeader @programYear={{programYear}} @canUpdate={{canUpdate}} />`);
    assert.equal(programYearModel.get('published'), false);
    assert.equal(programYearModel.get('publishedAsTbd'), true);
    await click('.programyear-publication button');
    assert.equal(programYearModel.get('published'), true);
    assert.equal(programYearModel.get('publishedAsTbd'), false);
  });
});
