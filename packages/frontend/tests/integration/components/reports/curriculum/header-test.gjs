import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/curriculum/header';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import Header from 'frontend/components/reports/curriculum/header';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | reports/curriculum/header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders for session objectives and is accessible', async function (assert) {
    await render(
      <template>
        <Header
          @countSelectedCourses={{3}}
          @showReportResults={{false}}
          @selectedReportValue="sessionObjectives"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.reportSelector.isPresent, 'ReportSelector component is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      2,
      'ReportSelector component has two options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'ReportSelector has correct first option text',
    );
    assert.ok(
      component.reportSelector.options[0].isSelected,
      'ReportSelector first option is chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Learner Groups',
      'ReportSelector has correct second option text',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'ReportSelector second option is not chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 3 courses'),
      'summary text has correct number of courses',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each session objective is listed along with instructors and course data.',
        'summary text is correct',
      ),
    );
    assert.ok(component.runReport.isPresent);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders for session objectives across multiple schools', async function (assert) {
    this.schools = this.server.createList('school', 2);
    const course1 = this.server.create('course', { school: this.schools[0] });
    const course2 = this.server.create('course', { school: this.schools[1] });
    this.courses = [course1, course2];

    await render(
      <template>
        <Header
          @selectedSchoolIds={{array "1" "2"}}
          @countSelectedCourses={{2}}
          @showReportResults={{false}}
          @selectedReportValue="sessionObjectives"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.reportSelector.isPresent, 'report types selector is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      2,
      'report types selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'first report type option text is correct',
    );
    assert.ok(
      component.reportSelector.options[0].isSelected,
      'first report type option is selected',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Learner Groups',
      'second report type option text is correct',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'second report type option is not selected',
    );
    assert.ok(
      component.runSummaryText.includes('for 2 courses, across 2 schools'),
      'summary includes correct number of courses and schools',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each session objective is listed along with instructors and course data.',
      ),
    );
    assert.ok(component.runReport.isPresent);
  });

  test('it renders for learner groups and is accessible', async function (assert) {
    await render(
      <template>
        <Header
          @countSelectedCourses={{5}}
          @showReportResults={{false}}
          @selectedReportValue="learnerGroups"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.reportSelector.isPresent);
    assert.strictEqual(component.reportSelector.options.length, 2);
    assert.strictEqual(component.reportSelector.options[0].text, 'Session Objectives');
    assert.notOk(component.reportSelector.options[0].isSelected);
    assert.strictEqual(component.reportSelector.options[1].text, 'Learner Groups');
    assert.ok(component.reportSelector.options[1].isSelected);
    assert.ok(component.runSummaryText.includes('for 5 courses'));
    assert.ok(
      component.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
    );
    assert.ok(component.runReport.isPresent);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders for learner groups across multiple schools', async function (assert) {
    await render(
      <template>
        <Header
          @selectedSchoolIds={{array "1" "2" "3"}}
          @countSelectedCourses={{5}}
          @showReportResults={{false}}
          @selectedReportValue="learnerGroups"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.reportSelector.isPresent, 'report types selector is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      2,
      'report types selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'first report type option text is correct',
    );
    assert.notOk(
      component.reportSelector.options[0].isSelected,
      'first report type option is chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Learner Groups',
      'second report type option text is correct',
    );
    assert.ok(
      component.reportSelector.options[1].isSelected,
      'second report type option text is not chosen',
    );
    assert.ok(component.runSummaryText.includes('for 5 courses, across 3 schools'));
    assert.ok(
      component.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
    );
    assert.ok(component.runReport.isPresent, 'report results are visible');
  });

  test('it changes selected report', async function (assert) {
    this.set('selectedReportValue', 'sessionObjectives');
    this.set('changeSelectedReport', (value) => {
      this.set('selectedReportValue', value);
    });
    await render(
      <template>
        <Header
          @countSelectedCourses={{5}}
          @showReportResults={{false}}
          @selectedReportValue={{this.selectedReportValue}}
          @changeSelectedReport={{this.changeSelectedReport}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.reportSelector.value, 'sessionObjectives');
    await component.reportSelector.set('learnerGroups');
    assert.strictEqual(component.reportSelector.value, 'learnerGroups');
    assert.ok(
      component.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
    );
  });

  test('it runs report', async function (assert) {
    this.set('showReportResults', false);
    this.set('runReport', () => {
      this.set('showReportResults', true);
    });
    this.set('close', () => {
      this.set('showReportResults', false);
    });
    await render(
      <template>
        <Header
          @countSelectedCourses={{5}}
          @showReportResults={{this.showReportResults}}
          @selectedReportValue="sessionObjectives"
          @changeSelectedReport={{(noop)}}
          @runReport={{this.runReport}}
          @close={{this.close}}
          @download={{(noop)}}
        />
      </template>,
    );

    assert.ok(component.runReport.isPresent);
    assert.notOk(component.close.isPresent);
    assert.notOk(component.download.isPresent);
    await component.runReport.click();
    assert.ok(component.close.isPresent);
    assert.ok(component.download.isPresent);
    assert.notOk(component.runReport.isPresent);
    await component.close.click();
    assert.ok(component.runReport.isPresent);
    assert.notOk(component.close.isPresent);
    assert.notOk(component.download.isPresent);
  });
});
