import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/school-competencies-list-item';

module('Integration | Component | school-competencies-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const pcrs1 = this.server.create('aamcPcrs', {
      description: 'Zylinder',
    });
    const pcrs2 = this.server.create('aamcPcrs', {
      description: 'Alfons',
    });
    const domain = this.server.create('competency', {
      aamcPcrses: [pcrs1, pcrs2],
    });
    const competency = this.server.create('competency', {
      parent: domain,
    });
    this.pcrsModel1 = await this.owner.lookup('service:store').find('aamcPcrs', pcrs1.id);
    this.pcrsModel2 = await this.owner.lookup('service:store').find('aamcPcrs', pcrs2.id);
    this.competencyModel = await this.owner
      .lookup('service:store')
      .find('competency', competency.id);
    this.domainModel = await this.owner.lookup('service:store').find('competency', domain.id);
  });

  test('it renders - domain', async function (assert) {
    this.set('competency', this.domainModel);
    await render(hbs`<SchoolCompetenciesListItem
      @competency={{this.competency}}
      @isDomain={{true}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.title.text, 'competency 0');
    assert.notOk(component.title.isCompetency);
    assert.ok(component.title.isDomain);
    assert.strictEqual(component.pcrs.items.length, 2);
    assert.strictEqual(component.pcrs.items[0].text, '1 Zylinder');
    assert.strictEqual(component.pcrs.items[1].text, '2 Alfons');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders - competency', async function (assert) {
    this.set('competency', this.competencyModel);
    await render(hbs`<SchoolCompetenciesListItem
      @competency={{this.competency}}
      @isDomain={{false}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.title.text, 'competency 1');
    assert.ok(component.title.isCompetency);
    assert.notOk(component.title.isDomain);
    assert.strictEqual(component.pcrs.items.length, 1);
    assert.strictEqual(component.pcrs.items[0].text, 'Click to edit');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
