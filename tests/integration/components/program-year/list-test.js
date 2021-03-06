import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/program-year/list';

module('Integration | Component | program-year/list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.permissionCheckerMock = Service.extend({
      canDeleteProgramYear() {
        return true;
      },
      canLockProgramYear() {
        return true;
      },
      canUnlockProgramYear() {
        return true;
      }
    });
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
  });

  test('it renders short year', async function(assert) {
    this.server.get('application/config', function() {
      return { config: {
        academicYearCrossesCalendarYearBoundaries: false,
      }};
    });
    const school = this.server.create('school');
    const programYears = [1, 2, 3].map(() => {
      const cohort = this.server.create('cohort');
      return this.server.create('program-year', { cohort });
    });
    const program = this.server.create('program', { school, programYears });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    this.set('program', programModel);
    await render(hbs`<ProgramYear::List @canUpdate={{false}} @program={{this.program}} />`);

    assert.equal(component.items.length, 3);
    assert.equal(component.items[0].link.text, '2012');
    assert.equal(component.items[1].link.text, '2013');
    assert.equal(component.items[2].link.text, '2014');
  });

  test('it renders long year', async function(assert) {
    this.server.get('application/config', function() {
      return { config: {
        academicYearCrossesCalendarYearBoundaries: true,
      }};
    });
    const school = this.server.create('school');
    const programYears = [1, 2, 3].map(() => {
      const cohort = this.server.create('cohort');
      return this.server.create('program-year', { cohort });
    });
    const program = this.server.create('program', { school, programYears });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    this.set('program', programModel);
    await render(hbs`<ProgramYear::List @canUpdate={{false}} @program={{this.program}} />`);

    assert.equal(component.items.length, 3);
    assert.equal(component.items[0].link.text, '2012 - 2013');
    assert.equal(component.items[1].link.text, '2013 - 2014');
    assert.equal(component.items[2].link.text, '2014 - 2015');
  });
});
