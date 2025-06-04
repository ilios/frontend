import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/results';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import SubjectResults from 'frontend/components/reports/subject-results';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/subject-results', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school', { id: 1, title: 'school 0' });
    this.server.create('course', { school: this.school });

    const report = this.server.create('report', {
      subject: 'course',
      user: this.server.create('user'),
    });
    this.server.post('api/graphql', ({ db }) => {
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId, schoolId }) => {
            const school = db.schools.find(schoolId);
            return { id, title, year, externalId, school };
          }),
        },
      };
    });

    this.set('report', await this.owner.lookup('service:store').findRecord('report', report.id));
  });

  test('it renders with single school', async function (assert) {
    await render(
      <template>
        <SubjectResults
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
          @changeYear={{(noop)}}
          @year={{null}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 1, 'result count is correct');
    assert.strictEqual(component.results[0].text, '2013 course 0', 'first result text is correct');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with all schools', async function (assert) {
    this.school2 = this.server.create('school', { id: 2, title: 'school 1' });
    this.server.create('course', { school: this.school2 });
    this.server.post('api/graphql', ({ db }) => {
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId, schoolId }) => {
            const school = db.schools.find(schoolId);
            return { id, title, year, externalId, school };
          }),
        },
      };
    });

    await render(
      <template>
        <SubjectResults
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{null}}
          @changeYear={{(noop)}}
          @year={{null}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2, 'result count is correct');
    assert.strictEqual(
      component.results[0].text,
      'school 0: 2013 course 0',
      'first result text is correct',
    );
    assert.strictEqual(
      component.results[1].text,
      'school 1: 2013 course 1',
      'second result text is correct',
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
