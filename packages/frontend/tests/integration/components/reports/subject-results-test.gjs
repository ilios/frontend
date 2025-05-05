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
    this.server.create('course');
    const report = this.server.create('report', {
      subject: 'course',
      user: this.server.create('user'),
    });
    this.server.post('api/graphql', ({ db }) => {
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });

    this.set('report', await this.owner.lookup('service:store').findRecord('report', report.id));
  });

  test('it renders', async function (assert) {
    await render(
      <template>
        <SubjectResults
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @year={{null}}
          @changeYear={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 1);
    assert.strictEqual(component.results[0].text, '2013 course 0');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
