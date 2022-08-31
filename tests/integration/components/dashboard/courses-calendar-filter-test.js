import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/dashboard/courses-calendar-filter';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | dashboard/courses-calendar-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
    await render(hbs`<Dashboard::CoursesCalendarFilter
      @school={{this.school}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.strictEqual(component.years.length, 3);
    assert.strictEqual(parseInt(component.years[0].title, 10), thisYear - 1);
    assert.strictEqual(parseInt(component.years[1].title, 10), thisYear);
    assert.strictEqual(parseInt(component.years[2].title, 10), thisYear + 1);

    assert.strictEqual(component.years[0].courses.length, 0);
    assert.strictEqual(component.years[1].courses.length, 0);
    assert.strictEqual(component.years[2].courses.length, 2);
    assert.strictEqual(component.years[2].courses[0].title, 'course 2 (1)');
    assert.strictEqual(component.years[2].courses[1].title, 'course 3 (1)');

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
    await render(hbs`<Dashboard::CoursesCalendarFilter
      @school={{this.school}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.strictEqual(component.years[0].title, `${thisYear - 1} - ${thisYear}`);
    assert.strictEqual(component.years[1].title, `${thisYear} - ${thisYear + 1}`);
    assert.strictEqual(component.years[2].title, `${thisYear + 1} - ${thisYear + 2}`);
  });

  test('clicking year toggles', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('course', 2, {
      school,
      year: 2014,
    });
    this.server.createList('course', 2, {
      school,
      year: 2015,
    });
    this.server.createList('course', 2, {
      school,
      year: 2016,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<Dashboard::CoursesCalendarFilter
      @school={{this.school}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.strictEqual(component.years.length, 3);

    assert.strictEqual(component.years[0].courses.length, 0);
    assert.strictEqual(component.years[1].courses.length, 0);
    assert.strictEqual(component.years[2].courses.length, 2);
    assert.strictEqual(component.years[2].courses[0].title, 'course 4');
    assert.strictEqual(component.years[2].courses[1].title, 'course 5');

    await component.years[0].toggle();
    await component.years[1].toggle();
    await component.years[2].toggle();

    assert.strictEqual(component.years.length, 3);

    assert.strictEqual(component.years[0].courses.length, 2);
    assert.strictEqual(component.years[0].courses[0].title, 'course 0');
    assert.strictEqual(component.years[0].courses[1].title, 'course 1');

    assert.strictEqual(component.years[1].courses.length, 2);
    assert.strictEqual(component.years[1].courses[0].title, 'course 2');
    assert.strictEqual(component.years[1].courses[1].title, 'course 3');

    assert.strictEqual(component.years[2].courses.length, 0);
  });

  test('opens last year if current year has no courses', async function (assert) {
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
    await render(hbs`<Dashboard::CoursesCalendarFilter
      @school={{this.school}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.strictEqual(component.years.length, 2);
    assert.strictEqual(component.years[0].title, `2014`);
    assert.strictEqual(component.years[1].title, `2015`);

    assert.strictEqual(component.years[0].courses.length, 0);
    assert.strictEqual(component.years[1].courses.length, 2);
    assert.strictEqual(component.years[1].courses[0].title, 'course 0');
    assert.strictEqual(component.years[1].courses[1].title, 'course 1');
  });

  test('selected courses are checked', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('course', 4, {
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<Dashboard::CoursesCalendarFilter
      @school={{this.school}}
      @selectedCourseIds={{array "2" "3"}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);
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
    assert.expect(2);
    const school = this.server.create('school');
    this.server.create('course', {
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('remove', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(hbs`<Dashboard::CoursesCalendarFilter
      @school={{this.school}}
      @selectedCourseIds={{array "1"}}
      @add={{(noop)}}
      @remove={{this.remove}}
    />`);
    assert.ok(component.years[0].courses[0].isChecked);
    await component.years[0].courses[0].toggle();
  });

  test('unselected courses toggle add', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    this.server.create('course', {
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('add', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(hbs`<Dashboard::CoursesCalendarFilter
      @school={{this.school}}
      @add={{this.add}}
      @remove={{(noop)}}
    />`);
    assert.notOk(component.years[0].courses[0].isChecked);
    await component.years[0].courses[0].toggle();
  });
});
