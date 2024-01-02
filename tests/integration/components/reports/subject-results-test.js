import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/reports/results';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/subject-results', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

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
    await render(hbs`<Reports::SubjectResults
      @subject={{this.report.subject}}
      @prepositionalObject={{this.report.prepositionalObject}}
      @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
      @year={{null}}
      @changeYear={{(noop)}}
    />`);

    assert.strictEqual(component.results.length, 1);
    assert.strictEqual(component.results[0].text, '2013 course 0');

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });
});
