import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/dashboard/courses-calendar-filter';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { DateTime } from 'luxon';
import CoursesCalendarFilter from 'ilios-common/components/dashboard/courses-calendar-filter';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | dashboard/courses-calendar-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const thisYear = 2019;
    const school = this.server.create('school');
    this.server.createList('course', 2, {
      school,
      year: thisYear,
    });
    this.server.createList('course', 2, {
      school,
      year: thisYear + 1,
      externalId: 1,
    });
    this.server.createList('course', 2, {
      school,
      year: thisYear - 1,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <CoursesCalendarFilter @school={{this.school}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.years.length, 3);
    assert.strictEqual(parseInt(component.years[0].title, 10), thisYear + 1);
    assert.strictEqual(parseInt(component.years[1].title, 10), thisYear);
    assert.strictEqual(parseInt(component.years[2].title, 10), thisYear - 1);

    assert.ok(component.years[0].isExpanded);
    assert.notOk(component.years[1].isExpanded);
    assert.notOk(component.years[2].isExpanded);

    assert.strictEqual(component.years[0].courses.length, 2);
    assert.strictEqual(component.years[1].courses.length, 0);
    assert.strictEqual(component.years[2].courses.length, 0);

    assert.strictEqual(component.years[0].courses[0].title, 'course 2 (1)');
    assert.strictEqual(component.years[0].courses[1].title, 'course 3 (1)');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('course years are shown as ranges if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const thisYear = 2019;
    const school = this.server.create('school');
    this.server.createList('course', 2, {
      school,
      year: thisYear,
    });
    this.server.createList('course', 2, {
      school,
      year: thisYear + 1,
      externalId: 1,
    });
    this.server.createList('course', 2, {
      school,
      year: thisYear - 1,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <CoursesCalendarFilter @school={{this.school}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.years[0].title, `${thisYear + 1} - ${thisYear + 2}`);
    assert.strictEqual(component.years[1].title, `${thisYear} - ${thisYear + 1}`);
    assert.strictEqual(component.years[2].title, `${thisYear - 1} - ${thisYear}`);
  });

  test('clicking year toggles', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('course', 2, {
      school,
      year: 2016,
    });
    this.server.createList('course', 2, {
      school,
      year: 2015,
    });
    this.server.createList('course', 2, {
      school,
      year: 2014,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <CoursesCalendarFilter @school={{this.school}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.years.length, 3);

    assert.strictEqual(component.years[0].courses.length, 2);
    assert.strictEqual(component.years[0].courses[0].title, 'course 0');
    assert.strictEqual(component.years[0].courses[1].title, 'course 1');
    assert.strictEqual(component.years[1].courses.length, 0);
    assert.strictEqual(component.years[2].courses.length, 0);

    await component.years[0].toggle();
    await component.years[1].toggle();
    await component.years[2].toggle();

    assert.strictEqual(component.years.length, 3);

    assert.strictEqual(component.years[0].courses.length, 0);

    assert.strictEqual(component.years[1].courses.length, 2);
    assert.strictEqual(component.years[1].courses[0].title, 'course 2');
    assert.strictEqual(component.years[1].courses[1].title, 'course 3');

    assert.strictEqual(component.years[2].courses.length, 2);
    assert.strictEqual(component.years[2].courses[0].title, 'course 4');
    assert.strictEqual(component.years[2].courses[1].title, 'course 5');
  });

  test('opens latest year if current year has no courses', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('course', 2, {
      school,
      year: 2015,
    });
    this.server.createList('course', 2, {
      school,
      year: 2014,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <CoursesCalendarFilter @school={{this.school}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.years.length, 2);
    assert.strictEqual(component.years[0].title, `2015`);
    assert.strictEqual(component.years[1].title, `2014`);

    assert.strictEqual(component.years[0].courses.length, 2);
    assert.strictEqual(component.years[0].courses[0].title, 'course 0');
    assert.strictEqual(component.years[0].courses[1].title, 'course 1');
    assert.strictEqual(component.years[1].courses.length, 0);
  });

  function getCurrentAcademicYear() {
    const today = DateTime.now();
    const thisYear = Number(today.year);
    const thisMonth = Number(today.month);
    if (thisMonth < 4) {
      return thisYear - 1;
    }

    return thisYear;
  }

  test('opens current year if it has courses', async function (assert) {
    const currentYear = getCurrentAcademicYear();
    const school = this.server.create('school');
    this.server.createList('course', 2, {
      school,
      year: currentYear,
    });
    this.server.createList('course', 2, {
      school,
      year: currentYear + 1,
    });
    this.server.createList('course', 2, {
      school,
      year: currentYear - 1,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <CoursesCalendarFilter @school={{this.school}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.years.length, 3);
    assert.strictEqual(component.years[0].title, `${currentYear + 1}`);
    assert.strictEqual(component.years[1].title, `${currentYear}`);
    assert.strictEqual(component.years[2].title, `${currentYear - 1}`);

    assert.strictEqual(component.years[0].courses.length, 0);
    assert.strictEqual(component.years[1].courses.length, 2);
    assert.strictEqual(component.years[1].courses[0].title, 'course 0');
    assert.strictEqual(component.years[1].courses[1].title, 'course 1');
    assert.strictEqual(component.years[2].courses.length, 0);
  });

  test('selected courses are checked', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('course', 4, {
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <CoursesCalendarFilter
          @school={{this.school}}
          @selectedCourseIds={{array "2" "3"}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.years[0].courses.length, 4);
    assert.strictEqual(component.years[0].courses[0].title, 'course 0');
    assert.notOk(component.years[0].courses[0].isChecked);

    assert.strictEqual(component.years[0].courses[1].title, 'course 1');
    assert.ok(component.years[0].courses[1].isChecked);

    assert.strictEqual(component.years[0].courses[2].title, 'course 2');
    assert.ok(component.years[0].courses[2].isChecked);

    assert.strictEqual(component.years[0].courses[3].title, 'course 3');
    assert.notOk(component.years[0].courses[3].isChecked);
  });

  test('selected courses toggle remove', async function (assert) {
    const school = this.server.create('school');
    this.server.create('course', {
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('remove', (id) => {
      assert.step('remove called');
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <CoursesCalendarFilter
          @school={{this.school}}
          @selectedCourseIds={{array "1"}}
          @add={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    assert.ok(component.years[0].courses[0].isChecked);
    await component.years[0].courses[0].toggle();
    assert.verifySteps(['remove called']);
  });

  test('unselected courses toggle add', async function (assert) {
    const school = this.server.create('school');
    this.server.create('course', {
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('add', (id) => {
      assert.step('add called');
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <CoursesCalendarFilter @school={{this.school}} @add={{this.add}} @remove={{(noop)}} />
      </template>,
    );
    assert.notOk(component.years[0].courses[0].isChecked);
    await component.years[0].courses[0].toggle();
    assert.verifySteps(['add called']);
  });
});
