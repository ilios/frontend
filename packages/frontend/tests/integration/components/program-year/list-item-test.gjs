import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/program-year/list-item';
import ListItem from 'frontend/components/program-year/list-item';

module('Integration | Component | program-year/list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.permissionCheckerMock = class extends Service {
      async canDeleteProgramYear() {
        return true;
      }
      async canLockProgramYear() {
        return true;
      }
      async canUnlockProgramYear() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
  });

  test('it renders with cohort title', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort');
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <ListItem
          @programYear={{this.programYear}}
          @academicYearCrossesCalendarYearBoundaries={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'cohort 0');
  });

  test('it without cohort title', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort', { title: null });
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <ListItem
          @programYear={{this.programYear}}
          @academicYearCrossesCalendarYearBoundaries={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Class of 2016');
  });

  test('it renders single year', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort', { title: null });
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <ListItem
          @programYear={{this.programYear}}
          @academicYearCrossesCalendarYearBoundaries={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.link.text, '2012');
  });

  test('it renders double year', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort', { title: null });
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <ListItem
          @programYear={{this.programYear}}
          @academicYearCrossesCalendarYearBoundaries={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.link.text, '2012 - 2013');
  });

  test('can be deleted', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort');
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <ListItem
          @programYear={{this.programYear}}
          @academicYearCrossesCalendarYearBoundaries={{false}}
        />
      </template>,
    );
    assert.ok(component.canBeRemoved);
  });

  test('cannot be deleted', async function (assert) {
    this.permissionCheckerMock.reopen({
      canDeleteProgramYear() {
        return false;
      },
    });
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const cohort = this.server.create('cohort');
    const programYear = this.server.create('program-year', { program, cohort });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <ListItem
          @programYear={{this.programYear}}
          @academicYearCrossesCalendarYearBoundaries={{false}}
        />
      </template>,
    );
    assert.notOk(component.canBeRemoved);
  });
});
