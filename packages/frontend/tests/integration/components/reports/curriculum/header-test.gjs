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
    assert.ok(component.reportSelector.isPresent, 'report types selector component is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      5,
      'report types selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.ok(
      component.reportSelector.options[0].isSelected,
      'report types selector FIRST option IS chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'report types selector second option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct third option text',
    );
    assert.notOk(
      component.reportSelector.options[2].isSelected,
      'report types selector third option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'report types selector has correct fourth option text',
    );
    assert.notOk(
      component.reportSelector.options[3].isSelected,
      'report types selector fourth option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.notOk(
      component.reportSelector.options[4].isSelected,
      'report types selector fifth option is not chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 3 courses'),
      'summary includes correct number of courses',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each session objective is listed along with instructors and course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
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
      5,
      'report types selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.ok(
      component.reportSelector.options[0].isSelected,
      'report types selector FIRST option IS chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'report types selector second option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct third option text',
    );
    assert.notOk(
      component.reportSelector.options[2].isSelected,
      'report types selector third option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'report types selector has correct fourth option text',
    );
    assert.notOk(
      component.reportSelector.options[3].isSelected,
      'report types selector fourth option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.notOk(
      component.reportSelector.options[4].isSelected,
      'report types selector fifth option is not chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 2 courses, across 2 schools'),
      'summary includes correct number of courses and schools',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each session objective is listed along with instructors and course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
  });

  test('it renders for session offerings and is accessible', async function (assert) {
    await render(
      <template>
        <Header
          @countSelectedCourses={{3}}
          @showReportResults={{false}}
          @selectedReportValue="sessionOfferings"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.reportSelector.isPresent, 'report types selector component is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      5,
      'report types selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.notOk(
      component.reportSelector.options[0].isSelected,
      'report types selector first option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.ok(
      component.reportSelector.options[1].isSelected,
      'report types selector SECOND option IS chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct third option text',
    );
    assert.notOk(
      component.reportSelector.options[2].isSelected,
      'report types selector third option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'report types selector has correct fourth option text',
    );
    assert.notOk(
      component.reportSelector.options[3].isSelected,
      'report types selector fourth option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.notOk(
      component.reportSelector.options[4].isSelected,
      'report types selector fifth option is not chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 3 courses'),
      'summary includes correct number of courses',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each session offering is listed along with instructors, learner groups, and course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders for session offerings across multiple schools', async function (assert) {
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
          @selectedReportValue="sessionOfferings"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.reportSelector.isPresent, 'report types selector is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      5,
      'report types selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.notOk(
      component.reportSelector.options[0].isSelected,
      'report types selector first option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.ok(
      component.reportSelector.options[1].isSelected,
      'report types selector SECOND option IS chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct third option text',
    );
    assert.notOk(
      component.reportSelector.options[2].isSelected,
      'report types selector third option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'report types selector has correct fourth option text',
    );
    assert.notOk(
      component.reportSelector.options[3].isSelected,
      'report types selector fourth option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.notOk(
      component.reportSelector.options[4].isSelected,
      'report types selector fifth option is not chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 2 courses, across 2 schools'),
      'summary includes correct number of courses and schools',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each session offering is listed along with instructors, learner groups, and course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
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
    assert.ok(component.reportSelector.isPresent, 'report types selector is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      5,
      'report selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.notOk(
      component.reportSelector.options[0].isSelected,
      'report types selector first option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'report types selector second option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct third option text',
    );
    assert.ok(
      component.reportSelector.options[2].isSelected,
      'report types selector THIRD option IS chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'report types selector has correct fourth option text',
    );
    assert.notOk(
      component.reportSelector.options[3].isSelected,
      'report types selector fourth option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.notOk(
      component.reportSelector.options[4].isSelected,
      'report types selector fifth option is not chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 5 courses'),
      'summary includes correct number of courses',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
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
      5,
      'report types selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.notOk(
      component.reportSelector.options[0].isSelected,
      'report types selector first option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'report types selector second option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct fourth option text',
    );
    assert.ok(
      component.reportSelector.options[2].isSelected,
      'report types selector THIRD option IS chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'fourth report type option text is correct',
    );
    assert.notOk(
      component.reportSelector.options[3].isSelected,
      'report types selector fourth option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.notOk(
      component.reportSelector.options[4].isSelected,
      'report types selector fifth option is not chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 5 courses, across 3 schools'),
      'summary includes correct number of courses and schools',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
  });

  test('it renders for instructional time and is accessible', async function (assert) {
    await render(
      <template>
        <Header
          @countSelectedCourses={{7}}
          @showReportResults={{false}}
          @selectedReportValue="instructionalTime"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.ok(component.reportSelector.isPresent, 'report types selector is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      5,
      'report selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.notOk(
      component.reportSelector.options[0].isSelected,
      'report types selector first option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'report types selector second option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct third option text',
    );
    assert.notOk(
      component.reportSelector.options[2].isSelected,
      'report types selector third option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'report types selector has correct fourth option text',
    );
    assert.ok(
      component.reportSelector.options[3].isSelected,
      'report types selector FOURTH option IS chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.notOk(
      component.reportSelector.options[4].isSelected,
      'report types selector fifth option is not chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 7 courses'),
      'summary includes correct number of courses',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each attached instructor is listed along with course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders for instructional time across multiple schools', async function (assert) {
    await render(
      <template>
        <Header
          @selectedSchoolIds={{array "1" "2" "3" "4"}}
          @countSelectedCourses={{4}}
          @showReportResults={{false}}
          @selectedReportValue="instructionalTime"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.ok(component.reportSelector.isPresent, 'report types selector is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      5,
      'report types selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.notOk(
      component.reportSelector.options[0].isSelected,
      'report types selector first option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'report types selector second option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct fourth option text',
    );
    assert.notOk(
      component.reportSelector.options[2].isSelected,
      'report types selector third option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'fourth report type option text is correct',
    );
    assert.ok(
      component.reportSelector.options[3].isSelected,
      'report types selector FOURTH option IS chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.notOk(
      component.reportSelector.options[4].isSelected,
      'report types selector fifth option is not chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 4 courses, across 4 schools'),
      'summary includes correct number of courses and schools',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each attached instructor is listed along with course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
  });

  test('it renders for tagged terms and is accessible', async function (assert) {
    await render(
      <template>
        <Header
          @countSelectedCourses={{7}}
          @showReportResults={{false}}
          @selectedReportValue="taggedTerms"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.ok(component.reportSelector.isPresent, 'report types selector is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      5,
      'report selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.notOk(
      component.reportSelector.options[0].isSelected,
      'report types selector first option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'report types selector second option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct third option text',
    );
    assert.notOk(
      component.reportSelector.options[2].isSelected,
      'report types selector third option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'report types selector has correct fourth option text',
    );
    assert.notOk(
      component.reportSelector.options[3].isSelected,
      'report types selector fourth option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.ok(
      component.reportSelector.options[4].isSelected,
      'report types selector FIFTH option IS chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 7 courses'),
      'summary includes correct number of courses',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each set of attached terms is listed along with course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders for tagged terms across multiple schools', async function (assert) {
    await render(
      <template>
        <Header
          @selectedSchoolIds={{array "1" "2" "3" "4"}}
          @countSelectedCourses={{4}}
          @showReportResults={{false}}
          @selectedReportValue="taggedTerms"
          @changeSelectedReport={{(noop)}}
          @runReport={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.ok(component.reportSelector.isPresent, 'report types selector is present');
    assert.strictEqual(
      component.reportSelector.options.length,
      5,
      'report types selector has correct number of options',
    );
    assert.strictEqual(
      component.reportSelector.options[0].text,
      'Session Objectives',
      'report types selector has correct first option text',
    );
    assert.notOk(
      component.reportSelector.options[0].isSelected,
      'report types selector first option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[1].text,
      'Session Offerings',
      'report types selector has correct second option text',
    );
    assert.notOk(
      component.reportSelector.options[1].isSelected,
      'report types selector second option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[2].text,
      'Learner Groups',
      'report types selector has correct fourth option text',
    );
    assert.notOk(
      component.reportSelector.options[2].isSelected,
      'report types selector third option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[3].text,
      'Instructional Time',
      'fourth report type option text is correct',
    );
    assert.notOk(
      component.reportSelector.options[3].isSelected,
      'report types selector fourth option is not chosen',
    );
    assert.strictEqual(
      component.reportSelector.options[4].text,
      'Tagged Terms',
      'report types selector has correct fifth option text',
    );
    assert.ok(
      component.reportSelector.options[4].isSelected,
      'report types selector FIFTH option IS chosen',
    );
    assert.ok(
      component.runSummaryText.includes('for 4 courses, across 4 schools'),
      'summary includes correct number of courses and schools',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each set of attached terms is listed along with course data.',
      ),
      'summary description is correct',
    );
    assert.ok(component.runReport.isPresent, 'run report button is present');
    assert.ok(component.copy.isPresent, 'copy report button is present');
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
    assert.strictEqual(
      component.reportSelector.value,
      'sessionObjectives',
      'selected report is correct',
    );
    await component.reportSelector.set('sessionOfferings');
    assert.strictEqual(
      component.reportSelector.value,
      'sessionOfferings',
      'selected report is correct after changing value',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each session offering is listed along with instructors, learner groups, and course data.',
      ),
      'summary description is correct',
    );
    await component.reportSelector.set('learnerGroups');
    assert.strictEqual(
      component.reportSelector.value,
      'learnerGroups',
      'selected report is correct after changing value',
    );
    assert.ok(
      component.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
      'summary description is correct',
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
    assert.ok(component.copy.isPresent);
    assert.notOk(component.close.isPresent);
    assert.notOk(component.download.isPresent);
    await component.runReport.click();
    assert.ok(component.close.isPresent);
    assert.ok(component.copy.isPresent);
    assert.ok(component.download.isPresent);
    assert.notOk(component.runReport.isPresent);
    await component.close.click();
    assert.ok(component.runReport.isPresent);
    assert.ok(component.copy.isPresent);
    assert.notOk(component.close.isPresent);
    assert.notOk(component.download.isPresent);
  });
});
