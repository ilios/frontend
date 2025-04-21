import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { buildSchoolsFromData } from 'frontend/tests/helpers/curriculum-report';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';
import { component } from 'frontend/tests/pages/components/reports/curriculum';

module('Integration | Component | reports/curriculum', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
    const year = this.server.create('academicYear', {
      id: currentAcademicYear(),
    });
    this.server.createList('course', 2, {
      school,
      year: year.id,
    });
  });

  test('it renders and is accessible with no courses selected', async function (assert) {
    this.set('schools', buildSchoolsFromData(this.server));
    await render(hbs`<Reports::Curriculum
  @selectedCourseIds={{(array)}}
  @setSelectedCourseIds={{(noop)}}
  @report='sessionObjectives'
  @setReport={{(noop)}}
  @schools={{this.schools}}
  @run={{(noop)}}
  @stop={{(noop)}}
  @showReportResults={{false}}
/>`);
    assert.notOk(component.header.reportSelector.isPresent);
    assert.strictEqual(component.header.runSummaryText, 'Select Courses to Run Report');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible with courses selected', async function (assert) {
    this.set('schools', buildSchoolsFromData(this.server));
    await render(hbs`<Reports::Curriculum
  @selectedCourseIds={{array '1'}}
  @setSelectedCourseIds={{(noop)}}
  @report='sessionObjectives'
  @setReport={{(noop)}}
  @schools={{this.schools}}
  @run={{(noop)}}
  @stop={{(noop)}}
  @showReportResults={{false}}
/>`);
    assert.ok(component.header.reportSelector.isPresent);
    assert.ok(
      component.header.runSummaryText.includes(
        'Each session objective is listed along with instructors and course data.',
      ),
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('run works', async function (assert) {
    assert.expect(1);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('run', () => {
      assert.ok(true);
    });
    await render(hbs`<Reports::Curriculum
  @selectedCourseIds={{array '1'}}
  @setSelectedCourseIds={{(noop)}}
  @report='sessionObjectives'
  @setReport={{(noop)}}
  @schools={{this.schools}}
  @run={{this.run}}
  @stop={{(noop)}}
  @showReportResults={{false}}
/>`);
    await component.header.runReport.click();
  });

  test('stop works', async function (assert) {
    assert.expect(1);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('stop', () => {
      assert.ok(true);
    });
    await render(hbs`<Reports::Curriculum
  @selectedCourseIds={{array '1'}}
  @setSelectedCourseIds={{(noop)}}
  @report='sessionObjectives'
  @setReport={{(noop)}}
  @schools={{this.schools}}
  @run={{(noop)}}
  @stop={{this.stop}}
  @showReportResults={{true}}
/>`);
    await component.header.close.click();
  });

  test('adding course works', async function (assert) {
    assert.expect(2);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('setSelectedSchoolIds', (selectedSchoolIds) => {
      assert.deepEqual(selectedSchoolIds, [1, 1]);
    });
    this.set('setSelectedCourseIds', (selectedCourseIds) => {
      assert.deepEqual(selectedCourseIds, [1, 2]);
    });
    await render(hbs`<Reports::Curriculum
  @selectedSchoolIds={{array '1'}}
  @setSelectedSchoolIds={{this.setSelectedSchoolIds}}
  @selectedCourseIds={{array '1'}}
  @setSelectedCourseIds={{this.setSelectedCourseIds}}
  @report='sessionObjectives'
  @setReport={{(noop)}}
  @schools={{this.schools}}
  @run={{(noop)}}
  @stop={{(noop)}}
  @showReportResults={{false}}
/>`);

    await component.chooseCourse.years[0].courses[1].pick();
  });

  test('removing course works', async function (assert) {
    assert.expect(2);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('setSelectedSchoolIds', (selectedSchoolIds) => {
      assert.deepEqual(selectedSchoolIds, []);
    });
    this.set('setSelectedCourseIds', (selectedCourseIds) => {
      assert.deepEqual(selectedCourseIds, [1]);
    });
    await render(hbs`<Reports::Curriculum
  @selectedSchoolIds={{array '1'}}
  @setSelectedSchoolIds={{this.setSelectedSchoolIds}}
  @selectedCourseIds={{array '1' '2'}}
  @setSelectedCourseIds={{this.setSelectedCourseIds}}
  @report='sessionObjectives'
  @setReport={{(noop)}}
  @schools={{this.schools}}
  @run={{(noop)}}
  @stop={{(noop)}}
  @showReportResults={{false}}
/>`);
    await component.chooseCourse.years[0].courses[1].pick();
  });

  test('set report works', async function (assert) {
    assert.expect(1);
    this.set('schools', buildSchoolsFromData(this.server));
    this.set('setReport', (report) => {
      assert.strictEqual(report, 'learnerGroups');
    });
    await render(hbs`<Reports::Curriculum
  @selectedCourseIds={{array '1'}}
  @setSelectedCourseIds={{(noop)}}
  @report='sessionObjectives'
  @setReport={{this.setReport}}
  @schools={{this.schools}}
  @run={{(noop)}}
  @stop={{(noop)}}
  @showReportResults={{false}}
/>`);
    await component.header.reportSelector.set('learnerGroups');
  });
});
