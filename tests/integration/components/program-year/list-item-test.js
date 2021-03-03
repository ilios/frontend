import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/program-year/list-item';

module('Integration | Component | program-year/list-item', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders with cohort title', async function(assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort');
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::ListItem
      @programYear={{this.programYear}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);
    assert.equal(component.title, 'cohort 0');
  });

  test('it without cohort title', async function(assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort', { title: null });
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::ListItem
      @programYear={{this.programYear}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);
    assert.equal(component.title, 'Class of 2016');
  });

  test('it renders single year', async function(assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort', { title: null });
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::ListItem
      @programYear={{this.programYear}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);
    assert.equal(component.link.text, '2012');
  });

  test('it renders double year', async function(assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort', { title: null });
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::ListItem
      @programYear={{this.programYear}}
      @academicYearCrossesCalendarYearBoundaries={{true}}
    />`);
    assert.equal(component.link.text, '2012 - 2013');
  });
});
