import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/school-competencies-list';
import SchoolCompetenciesList from 'frontend/components/school-competencies-list';

module('Integration | Component | school competencies list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const pcrs1 = this.server.create('aamc-pcrs');
    const pcrs2 = this.server.create('aamc-pcrs');
    const pcrs3 = this.server.create('aamc-pcrs');
    const domain = this.server.create('competency', { title: 'domain 0' });
    this.server.create('competency', {
      title: 'competency 0',
      parent: domain,
      aamcPcrses: [pcrs1, pcrs2],
    });
    this.server.create('competency', {
      title: 'competency 1',
      parent: domain,
      aamcPcrses: [pcrs3],
    });
    const domainModel = await this.owner
      .lookup('service:store')
      .findRecord('competency', domain.id);

    this.set('domains', [domainModel]);
    await render(<template><SchoolCompetenciesList @domains={{this.domains}} /></template>);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title.text, 'domain 0');
    assert.strictEqual(component.items[0].pcrs.items.length, 1);
    assert.strictEqual(component.items[0].pcrs.items[0].text, 'None');
    assert.ok(component.items[0].title.isDomain);
    assert.strictEqual(component.items[1].title.text, 'competency 0');
    assert.strictEqual(component.items[1].pcrs.items.length, 2);
    assert.strictEqual(component.items[1].pcrs.items[0].text, '1 aamc pcrs 0');
    assert.strictEqual(component.items[1].pcrs.items[1].text, '2 aamc pcrs 1');
    assert.ok(component.items[1].title.isCompetency);
    assert.strictEqual(component.items[2].title.text, 'competency 1');
    assert.ok(component.items[2].title.isCompetency);
    assert.strictEqual(component.items[2].pcrs.items.length, 1);
    assert.strictEqual(component.items[2].pcrs.items[0].text, '3 aamc pcrs 2');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
