import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'frontend/tests/helpers';
import ThemeImages from 'frontend/components/user-profile/theme-images';
import { component } from 'frontend/tests/pages/components/user-profile/theme-images';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | user-profile/theme-images', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders system mode student', async function (assert) {
    await render(
      <template><ThemeImages @performsNonLearnerFunction={{false}} @mode="system" /></template>,
    );

    assert.strictEqual(component.studentPreviews.length, 2);
    assert.strictEqual(component.nonStudentPreviews.length, 0);

    assert.true(component.studentPreviews[0].isLight);
    assert.false(component.studentPreviews[0].isDark);

    assert.false(component.studentPreviews[1].isLight);
    assert.true(component.studentPreviews[1].isDark);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders dark mode student', async function (assert) {
    await render(
      <template><ThemeImages @performsNonLearnerFunction={{false}} @mode="dark" /></template>,
    );

    assert.strictEqual(component.studentPreviews.length, 1);
    assert.strictEqual(component.nonStudentPreviews.length, 0);
    assert.false(component.studentPreviews[0].isLight);
    assert.true(component.studentPreviews[0].isDark);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders light mode student', async function (assert) {
    await render(
      <template><ThemeImages @performsNonLearnerFunction={{false}} @mode="light" /></template>,
    );

    assert.strictEqual(component.studentPreviews.length, 1);
    assert.strictEqual(component.nonStudentPreviews.length, 0);
    assert.true(component.studentPreviews[0].isLight);
    assert.false(component.studentPreviews[0].isDark);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders dark mode non-student', async function (assert) {
    await render(
      <template><ThemeImages @performsNonLearnerFunction={{true}} @mode="dark" /></template>,
    );

    assert.strictEqual(component.studentPreviews.length, 0);
    assert.strictEqual(component.nonStudentPreviews.length, 2);
    assert.false(component.nonStudentPreviews[0].isLight);
    assert.true(component.nonStudentPreviews[0].isDark);
    assert.false(component.nonStudentPreviews[1].isLight);
    assert.true(component.nonStudentPreviews[1].isDark);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders light mode non-student', async function (assert) {
    await render(
      <template><ThemeImages @performsNonLearnerFunction={{true}} @mode="light" /></template>,
    );

    assert.strictEqual(component.studentPreviews.length, 0);
    assert.strictEqual(component.nonStudentPreviews.length, 2);
    assert.true(component.nonStudentPreviews[0].isLight);
    assert.false(component.nonStudentPreviews[0].isDark);
    assert.true(component.nonStudentPreviews[1].isLight);
    assert.false(component.nonStudentPreviews[1].isDark);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders system mode non-student', async function (assert) {
    await render(
      <template><ThemeImages @performsNonLearnerFunction={{true}} @mode="system" /></template>,
    );

    assert.strictEqual(component.studentPreviews.length, 0);
    assert.strictEqual(component.nonStudentPreviews.length, 4);

    assert.true(component.nonStudentPreviews[0].isLight);
    assert.true(component.nonStudentPreviews[0].hasFullNavigation);
    assert.false(component.nonStudentPreviews[0].hasTopNavigation);

    assert.true(component.nonStudentPreviews[1].isLight);
    assert.false(component.nonStudentPreviews[1].hasFullNavigation);
    assert.true(component.nonStudentPreviews[1].hasTopNavigation);

    assert.true(component.nonStudentPreviews[2].isDark);
    assert.true(component.nonStudentPreviews[2].hasFullNavigation);
    assert.false(component.nonStudentPreviews[2].hasTopNavigation);

    assert.true(component.nonStudentPreviews[3].isDark);
    assert.false(component.nonStudentPreviews[3].hasFullNavigation);
    assert.true(component.nonStudentPreviews[3].hasTopNavigation);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
