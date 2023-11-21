import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/reports/run-subject';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/run-subject', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(4);
    this.server.create('course');
    const report = this.server.create('report', {
      subject: 'course',
      user: this.server.create('user'),
    });
    this.server.post('api/graphql', ({ db }, { requestBody }) => {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
      return {
        data: {
          courses: db.courses.map(({ id, title, year, externalId }) => {
            return { id, title, year, externalId };
          }),
        },
      };
    });

    this.set('report', await this.owner.lookup('service:store').findRecord('report', report.id));
    await render(hbs`<Reports::RunSubject @report={{this.report}} @runSubjectReport={{(noop)}} />`);

    assert.strictEqual(component.results.results.length, 1);
    assert.strictEqual(component.results.results[0].text, '2013 course 0');

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });
});
