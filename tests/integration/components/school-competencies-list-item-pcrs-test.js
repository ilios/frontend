import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/school-competencies-list-item-pcrs';

module('Integration | Component | school-competencies-list-item-pcrs', function (hooks) {
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
    const competency = this.server.create('competency', {
      aamcPcrses: [pcrs1, pcrs2],
    });
    this.pcrsModel1 = await this.owner.lookup('service:store').findRecord('aamcPcrs', pcrs1.id);
    this.pcrsModel2 = await this.owner.lookup('service:store').findRecord('aamcPcrs', pcrs2.id);
    this.competencyModel = await this.owner
      .lookup('service:store')
      .findRecord('competency', competency.id);
  });

  test('it renders in non-managing mode', async function (assert) {
    this.set('competency', this.competencyModel);
    await render(hbs`<SchoolCompetenciesListItemPcrs
      @competency={{this.competency}}
      @canUpdate={{true}}
      @setIsManaging={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.items.length, 2);
    assert.strictEqual(component.items[0].text, '1 Zylinder');
    assert.strictEqual(component.items[1].text, '2 Alfons');
    assert.notOk(component.save.isVisible);
    assert.notOk(component.cancel.isVisible);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders in managing mode', async function (assert) {
    this.set('competency', this.competencyModel);
    await render(hbs`<SchoolCompetenciesListItemPcrs
      @competency={{this.competency}}
      @canUpdate={{true}}
      @setIsManaging={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.items.length, 0);
    assert.ok(component.save.isVisible);
    assert.ok(component.cancel.isVisible);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('manage', async function (assert) {
    assert.expect(1);
    this.set('competency', this.competencyModel);
    this.set('manage', (isManaging) => {
      assert.ok(isManaging);
    });
    this.set('competency', this.competencyModel);
    await render(hbs`<SchoolCompetenciesListItemPcrs
      @competency={{this.competency}}
      @canUpdate={{true}}
      @setIsManaging={{this.manage}}
      @isManaging={{false}}
      @save={{(noop)}}
      @cancel={{(noop)}}
    />
`);
    await component.items[0].edit();
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('competency', this.competencyModel);
    this.set('cancel', (isManaging) => {
      assert.ok(isManaging);
    });
    this.set('competency', this.competencyModel);
    await render(hbs`<SchoolCompetenciesListItemPcrs
      @competency={{this.competency}}
      @canUpdate={{true}}
      @setIsManaging={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @cancel={{this.cancel}}
    />
`);
    await component.cancel.click();
  });

  test('save', async function (assert) {
    assert.expect(1);
    this.set('competency', this.competencyModel);
    this.set('save', () => {
      assert.ok(true);
    });
    this.set('competency', this.competencyModel);
    await render(hbs`<SchoolCompetenciesListItemPcrs
      @competency={{this.competency}}
      @canUpdate={{true}}
      @setIsManaging={{(noop)}}
      @isManaging={{true}}
      @save={{this.save}}
      @cancel={{(noop)}}
    />
`);
    await component.save.click();
  });

  test('no pcrs', async function (assert) {
    this.competencyModel.set('aamcPcrses', []);
    this.set('competency', this.competencyModel);
    await render(hbs`<SchoolCompetenciesListItemPcrs
      @competency={{this.competencyModel}}
      @canUpdate={{true}}
      @setIsManaging={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.items.length, 1);
    assert.strictEqual(component.items[0].text, 'Click to edit');
  });

  test('no pcrs in read-only mode', async function (assert) {
    this.competencyModel.set('aamcPcrses', []);
    this.set('competency', this.competencyModel);
    await render(hbs`<SchoolCompetenciesListItemPcrs
      @competency={{this.competencyModel}}
      @canUpdate={{false}}
      @setIsManaging={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.items.length, 1);
    assert.strictEqual(component.items[0].text, 'None');
  });
});
