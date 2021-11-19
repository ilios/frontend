import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/new-course';

module('Integration | Component | new course', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.school = await this.owner.lookup('service:store').find('school', school.id);
  });

  test('it renders', async function (assert) {
    const thisYear = new Date().getFullYear();
    await render(
      hbs`<NewCourse @currentSchool={{this.school}} @save={{(noop)}} @cancel={{(noop)}} />`
    );
    assert.strictEqual(component.years.length, 6);
    assert.strictEqual(component.years[0].text, 'Select Academic Year');
    assert.strictEqual(parseInt(component.years[1].text, 10), thisYear - 2);
    assert.strictEqual(parseInt(component.years[2].text, 10), thisYear - 1);
    assert.strictEqual(parseInt(component.years[3].text, 10), thisYear);
    assert.strictEqual(parseInt(component.years[4].text, 10), thisYear + 1);
    assert.strictEqual(parseInt(component.years[5].text, 10), thisYear + 2);
    assert.ok(component.years[0].selected);
    assert.notOk(component.years[1].selected);
    assert.notOk(component.years[2].selected);
    assert.notOk(component.years[3].selected);
    assert.notOk(component.years[4].selected);
    assert.notOk(component.years[5].selected);
  });

  test('given year is pre-selected', async function (assert) {
    const thisYear = new Date().getFullYear();
    const academicYear = this.server.create('academicYear', { id: thisYear });
    const academicYearModel = await this.owner
      .lookup('service:store')
      .find('academic-year', academicYear.id);
    this.set('year', academicYearModel);
    await render(
      hbs`<NewCourse @currentSchool={{this.school}} @save={{(noop)}} @cancel={{(noop)}} @currentYear={{this.year}} />`
    );
    assert.notOk(component.years[0].selected);
    assert.notOk(component.years[1].selected);
    assert.notOk(component.years[2].selected);
    assert.ok(component.years[3].selected);
    assert.notOk(component.years[4].selected);
    assert.notOk(component.years[5].selected);
  });

  test('given year is not pre-selected if it falls out of range', async function (assert) {
    const thisYear = new Date('1824-09-04').getFullYear();
    const academicYear = this.server.create('academicYear', { id: thisYear });
    const academicYearModel = await this.owner
      .lookup('service:store')
      .find('academic-year', academicYear.id);
    this.set('year', academicYearModel);
    await render(
      hbs`<NewCourse @currentSchool={{this.school}} @save={{(noop)}} @cancel={{(noop)}} @currentYear={{this.year}} />`
    );
    assert.ok(component.years[0].selected);
    assert.notOk(component.years[1].selected);
    assert.notOk(component.years[2].selected);
    assert.notOk(component.years[3].selected);
    assert.notOk(component.years[4].selected);
    assert.notOk(component.years[5].selected);
  });

  test('year options show range if applicable', async function (assert) {
    assert.expect(5);
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const thisYear = new Date().getFullYear();
    await render(
      hbs`<NewCourse @currentSchool={{this.school}} @save={{(noop)}} @cancel={{(noop)}} />`
    );
    assert.strictEqual(component.years[1].text, `${thisYear - 2} - ${thisYear - 1}`);
    assert.strictEqual(component.years[2].text, `${thisYear - 1} - ${thisYear}`);
    assert.strictEqual(component.years[3].text, `${thisYear} - ${thisYear + 1}`);
    assert.strictEqual(component.years[4].text, `${thisYear + 1} - ${thisYear + 2}`);
    assert.strictEqual(component.years[5].text, `${thisYear + 2} - ${thisYear + 3}`);
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(
      hbs`<NewCourse @currentSchool={{this.school}} @save={{(noop)}} @cancel={{this.cancel}} />`
    );
    await component.cancel();
  });

  test('save', async function (assert) {
    assert.expect(4);
    const thisYear = new Date().getFullYear();
    const academicYear = this.server.create('academicYear', { id: thisYear });
    const academicYearModel = await this.owner
      .lookup('service:store')
      .find('academic-year', academicYear.id);
    this.set('year', academicYearModel);
    this.set('save', async (course) => {
      assert.strictEqual(course.title, 'test course');
      assert.strictEqual(course.year, parseInt(academicYear.id, 10));
      assert.strictEqual(parseInt(course.level, 10), 1);
      const school = await course.school;
      assert.strictEqual(school.id, this.school.id);
    });
    await render(
      hbs`<NewCourse @currentSchool={{this.school}} @save={{this.save}} @cancel={{(noop)}} @currentYear={{this.year}} />`
    );
    await component.title('test course');
    await component.save();
  });

  test('save on pressing enter in title field', async function (assert) {
    assert.expect(4);
    const thisYear = new Date().getFullYear();
    const academicYear = this.server.create('academicYear', { id: thisYear });
    const academicYearModel = await this.owner
      .lookup('service:store')
      .find('academic-year', academicYear.id);
    this.set('year', academicYearModel);
    this.set('save', async (course) => {
      assert.strictEqual(course.title, 'test course');
      assert.strictEqual(course.year, parseInt(academicYear.id, 10));
      assert.strictEqual(parseInt(course.level, 10), 1);
      const school = await course.school;
      assert.strictEqual(school.id, this.school.id);
    });
    await render(
      hbs`<NewCourse @currentSchool={{this.school}} @save={{this.save}} @cancel={{(noop)}} @currentYear={{this.year}} />`
    );
    await component.title('test course');
    await component.submitOnEnter();
  });

  test('input validation fails if title is too short', async function (assert) {
    assert.expect(2);
    const thisYear = new Date().getFullYear();
    const academicYear = this.server.create('academicYear', { id: thisYear });
    const academicYearModel = await this.owner
      .lookup('service:store')
      .find('academic-year', academicYear.id);
    this.set('year', academicYearModel);
    this.set('save', () => {
      assert.ok(false, 'this code should never be invoked.');
    });
    await render(
      hbs`<NewCourse @currentSchool={{this.school}} @save={{this.save}} @cancel={{(noop)}} @currentYear={{this.year}} />`
    );
    assert.notOk(component.titleHasValidationError);
    await component.title('fo');
    await component.save();
    assert.ok(component.titleHasValidationError);
  });

  test('input validation fails if title is too long', async function (assert) {
    assert.expect(2);
    const thisYear = new Date().getFullYear();
    const academicYear = this.server.create('academicYear', { id: thisYear });
    const academicYearModel = await this.owner
      .lookup('service:store')
      .find('academic-year', academicYear.id);
    this.set('year', academicYearModel);
    this.set('save', () => {
      assert.ok(false, 'this code should never be invoked.');
    });
    await render(
      hbs`<NewCourse @currentSchool={{this.school}} @save={{this.save}} @cancel={{(noop)}} @currentYear={{this.year}} />`
    );
    assert.notOk(component.titleHasValidationError);
    await component.title('0123456789'.repeat(21));
    await component.save();
    assert.ok(component.titleHasValidationError);
  });
});
