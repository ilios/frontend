import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'frontend/tests/pages/components/reports/curriculum/header';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/curriculum/header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders for session objectives and is accessible', async function (assert) {
    await render(hbs`<Reports::Curriculum::Header
  @countSelectedCourses={{3}}
  @showReportResults={{false}}
  @selectedReportValue='sessionObjectives'
  @changeSelectedReport={{(noop)}}
  @runReport={{(noop)}}
  @close={{(noop)}}
/>`);
    assert.ok(component.reportSelector.isPresent);
    assert.strictEqual(component.reportSelector.options.length, 2);
    assert.strictEqual(component.reportSelector.options[0].text, 'Session Objectives');
    assert.ok(component.reportSelector.options[0].isSelected);
    assert.strictEqual(component.reportSelector.options[1].text, 'Learner Groups');
    assert.notOk(component.reportSelector.options[1].isSelected);
    assert.ok(component.runSummaryText.includes('for 3 courses'));
    assert.ok(
      component.runSummaryText.includes(
        'Each session objective is listed along with instructors and course data.',
      ),
    );
    assert.ok(component.runReport.isPresent);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders for session objectives across multiple schools', async function (assert) {
    await render(hbs`<Reports::Curriculum::Header
  @countSelectedSchools={{2}}
  @hasMultipleSchools={{true}}
  @countSelectedCourses={{3}}
  @showReportResults={{false}}
  @selectedReportValue='sessionObjectives'
  @changeSelectedReport={{(noop)}}
  @runReport={{(noop)}}
  @close={{(noop)}}
/>`);
    assert.ok(component.reportSelector.isPresent);
    assert.strictEqual(component.reportSelector.options.length, 2);
    assert.strictEqual(component.reportSelector.options[0].text, 'Session Objectives');
    assert.ok(component.reportSelector.options[0].isSelected);
    assert.strictEqual(component.reportSelector.options[1].text, 'Learner Groups');
    assert.notOk(component.reportSelector.options[1].isSelected);
    assert.ok(component.runSummaryText.includes('for 3 courses, across 2 schools'));
    assert.ok(
      component.runSummaryText.includes(
        'Each session objective is listed along with instructors and course data.',
      ),
    );
    assert.ok(component.runReport.isPresent);
  });

  test('it renders for learner groups and is accessible', async function (assert) {
    await render(hbs`<Reports::Curriculum::Header
  @countSelectedCourses={{5}}
  @showReportResults={{false}}
  @selectedReportValue='learnerGroups'
  @changeSelectedReport={{(noop)}}
  @runReport={{(noop)}}
  @close={{(noop)}}
/>`);
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
    await render(hbs`<Reports::Curriculum::Header
  @countSelectedSchools={{3}}
  @hasMultipleSchools={{true}}
  @countSelectedCourses={{5}}
  @showReportResults={{false}}
  @selectedReportValue='learnerGroups'
  @changeSelectedReport={{(noop)}}
  @runReport={{(noop)}}
  @close={{(noop)}}
/>`);
    assert.ok(component.reportSelector.isPresent);
    assert.strictEqual(component.reportSelector.options.length, 2);
    assert.strictEqual(component.reportSelector.options[0].text, 'Session Objectives');
    assert.notOk(component.reportSelector.options[0].isSelected);
    assert.strictEqual(component.reportSelector.options[1].text, 'Learner Groups');
    assert.ok(component.reportSelector.options[1].isSelected);
    assert.ok(component.runSummaryText.includes('for 5 courses, across 3 schools'));
    assert.ok(
      component.runSummaryText.includes(
        'Each attached learner group is listed along with instructors and course data.',
      ),
    );
    assert.ok(component.runReport.isPresent);
  });

  test('it changes selected report', async function (assert) {
    this.set('selectedReportValue', 'sessionObjectives');
    this.set('changeSelectedReport', (value) => {
      this.set('selectedReportValue', value);
    });
    await render(hbs`<Reports::Curriculum::Header
  @countSelectedCourses={{5}}
  @showReportResults={{false}}
  @selectedReportValue={{this.selectedReportValue}}
  @changeSelectedReport={{this.changeSelectedReport}}
  @runReport={{(noop)}}
  @close={{(noop)}}
/>`);
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
    await render(hbs`<Reports::Curriculum::Header
  @countSelectedCourses={{5}}
  @showReportResults={{this.showReportResults}}
  @selectedReportValue='sessionObjectives'
  @changeSelectedReport={{(noop)}}
  @runReport={{this.runReport}}
  @close={{this.close}}
  @download={{(noop)}}
/>`);

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
