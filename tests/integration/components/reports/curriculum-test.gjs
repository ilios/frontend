import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { buildSchoolsFromData } from 'frontend/tests/helpers/curriculum-report';
import { setupMSW } from 'ilios-common/msw';
import { setupAuthentication } from 'ilios-common';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';
import { component } from 'frontend/tests/pages/components/reports/curriculum';
import Curriculum from 'frontend/components/reports/curriculum';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/curriculum', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
    await setupAuthentication({ school });
    const year = await this.server.create('academicYear', {
      id: currentAcademicYear(),
    });
    await this.server.createList('course', 2, {
      school,
      year: year.id,
    });
  });

  test('it renders and is accessible with no report type or courses selected', async function (assert) {
    this.set('schools', buildSchoolsFromData(this.server.db));
    await render(
      <template>
        <Curriculum
          @selectedCourseIds={{(array)}}
          @setSelectedCourseIds={{(noop)}}
          @report=""
          @setReport={{(noop)}}
          @schools={{this.schools}}
          @run={{(noop)}}
          @stop={{(noop)}}
          @showReportResults={{false}}
        />
      </template>,
    );
    assert.ok(component.header.reportSelector.isPresent, 'report selector is present');
    assert.strictEqual(
      component.header.reportSelector.label,
      'Select Curriculum Report Type:',
      'report selector label is correct',
    );
    assert.ok(component.header.reportSelector.options[0].isSelected, 'first option is selected');
    assert.strictEqual(
      component.header.reportSelector.value,
      '',
      'report selector value is correct',
    );
    assert.strictEqual(component.header.runSummaryText, '', 'report header text correct');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible with report type selected but no courses', async function (assert) {
    this.set('schools', buildSchoolsFromData(this.server.db));
    await render(
      <template>
        <Curriculum
          @selectedCourseIds={{(array)}}
          @setSelectedCourseIds={{(noop)}}
          @report="courseCompetencies"
          @setReport={{(noop)}}
          @schools={{this.schools}}
          @run={{(noop)}}
          @stop={{(noop)}}
          @showReportResults={{false}}
        />
      </template>,
    );
    assert.ok(component.header.reportSelector.isPresent, 'report selector is present');
    assert.strictEqual(
      component.header.reportSelector.label,
      'Select Curriculum Report Type:',
      'report selector label is correct',
    );
    assert.ok(component.header.reportSelector.options[1].isSelected, 'second option is selected');
    assert.strictEqual(
      component.header.reportSelector.value,
      'courseCompetencies',
      'report selector value is correct',
    );
    assert.strictEqual(component.header.runSummaryText, 'Select Courses to Run Report');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible with report type and courses selected', async function (assert) {
    this.set('schools', buildSchoolsFromData(this.server.db));
    await render(
      <template>
        <Curriculum
          @selectedCourseIds={{array "1"}}
          @setSelectedCourseIds={{(noop)}}
          @report="courseCompetencies"
          @setReport={{(noop)}}
          @schools={{this.schools}}
          @run={{(noop)}}
          @stop={{(noop)}}
          @showReportResults={{false}}
        />
      </template>,
    );
    assert.ok(component.header.reportSelector.isPresent, 'report selector is present');
    assert.strictEqual(
      component.header.reportSelector.label,
      'Select Curriculum Report Type:',
      'report selector label is correct',
    );
    assert.ok(component.header.reportSelector.options[1].isSelected, 'second option is selected');
    assert.strictEqual(
      component.header.reportSelector.value,
      'courseCompetencies',
      'report selector value is correct',
    );
    assert.strictEqual(
      component.header.runSummaryText,
      'Run Course Competencies report for one course. Each competency is listed along with course and program year objectives.',
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('run works', async function (assert) {
    this.set('schools', buildSchoolsFromData(this.server.db));
    this.set('run', () => {
      assert.step('run called');
    });
    await render(
      <template>
        <Curriculum
          @selectedCourseIds={{array "1"}}
          @setSelectedCourseIds={{(noop)}}
          @report="sessionObjectives"
          @setReport={{(noop)}}
          @schools={{this.schools}}
          @run={{this.run}}
          @stop={{(noop)}}
          @showReportResults={{false}}
        />
      </template>,
    );
    await component.header.runReport.click();
    assert.verifySteps(['run called']);
  });

  test('stop works', async function (assert) {
    this.set('schools', buildSchoolsFromData(this.server.db));
    this.set('stop', () => {
      assert.step('stop called');
    });
    await render(
      <template>
        <Curriculum
          @selectedCourseIds={{array "1"}}
          @setSelectedCourseIds={{(noop)}}
          @report="sessionObjectives"
          @setReport={{(noop)}}
          @schools={{this.schools}}
          @run={{(noop)}}
          @stop={{this.stop}}
          @showReportResults={{true}}
        />
      </template>,
    );
    await component.header.close.click();
    assert.verifySteps(['stop called']);
  });

  test('adding course works', async function (assert) {
    this.set('schools', buildSchoolsFromData(this.server.db));
    this.set('setSelectedCourseIds', (selectedCourseIds) => {
      assert.step('setSelectedCourseIds called');
      assert.deepEqual(selectedCourseIds, [1, 2]);
    });
    this.set('year', currentAcademicYear());
    await render(
      <template>
        <Curriculum
          @selectedCourseIds={{array "1"}}
          @setSelectedCourseIds={{this.setSelectedCourseIds}}
          @expandedYears={{array this.year}}
          @report="sessionObjectives"
          @setReport={{(noop)}}
          @schools={{this.schools}}
          @run={{(noop)}}
          @stop={{(noop)}}
          @showReportResults={{false}}
        />
      </template>,
    );

    await component.chooseCourse.years[0].courses[1].pick();
    assert.verifySteps(['setSelectedCourseIds called']);
  });

  test('removing course works', async function (assert) {
    this.set('schools', buildSchoolsFromData(this.server.db));
    this.set('setSelectedCourseIds', (selectedCourseIds) => {
      assert.step('setSelectedCourseIds called');
      assert.deepEqual(selectedCourseIds, [1]);
    });
    this.set('year', currentAcademicYear());
    await render(
      <template>
        <Curriculum
          @selectedCourseIds={{array "1" "2"}}
          @setSelectedCourseIds={{this.setSelectedCourseIds}}
          @expandedYears={{array this.year}}
          @report="sessionObjectives"
          @setReport={{(noop)}}
          @schools={{this.schools}}
          @run={{(noop)}}
          @stop={{(noop)}}
          @showReportResults={{false}}
        />
      </template>,
    );
    await component.chooseCourse.years[0].courses[1].pick();
    assert.verifySteps(['setSelectedCourseIds called']);
  });
});
