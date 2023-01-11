import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/school-competencies-pcrs-mapper';

module('Integration | Component | school-competencies-pcrs-mapper', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const pcrs1 = this.server.create('aamcPcrs', {
      id: 'aamc-pcrs-comp-c0201',
      description: 'Foo',
    });
    const pcrs2 = this.server.create('aamcPcrs', {
      id: 'aamc-pcrs-comp-c0555',
      description: 'Bar',
    });
    const pcrs3 = this.server.create('aamcPcrs', {
      id: 'aamc-pcrs-comp-c0125',
      description: 'Baz',
    });
    const pcrs4 = this.server.create('aamcPcrs', {
      id: 'aamc-pcrs-comp-c0033',
      description: 'Fiz',
    });
    const pcrs5 = this.server.create('aamcPcrs', {
      id: 'aamc-pcrs-comp-c1522',
      description: 'Far',
    });
    this.pcrs1 = await this.owner.lookup('service:store').findRecord('aamcPcrs', pcrs1.id);
    this.pcrs2 = await this.owner.lookup('service:store').findRecord('aamcPcrs', pcrs2.id);
    this.pcrs3 = await this.owner.lookup('service:store').findRecord('aamcPcrs', pcrs3.id);
    this.pcrs4 = await this.owner.lookup('service:store').findRecord('aamcPcrs', pcrs4.id);
    this.pcrs5 = await this.owner.lookup('service:store').findRecord('aamcPcrs', pcrs5.id);
    this.allPcrses = [this.pcrs1, this.pcrs2, this.pcrs3, this.pcrs4, this.pcrs5];
  });

  test('it renders', async function (assert) {
    const selectedPcrses = [this.pcrs1, this.pcrs5];
    this.set('selectedPcrses', selectedPcrses);
    this.set('allPcrses', this.allPcrses);

    await render(hbs`<SchoolCompetenciesPcrsMapper
      @allPcrses={{this.allPcrses}}
      @selectedPcrses={{this.selectedPcrses}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.strictEqual(component.pcrs.length, 5);
    assert.notOk(component.pcrs[0].isChecked);
    assert.strictEqual(component.pcrs[0].text, '0.33 Fiz');
    assert.notOk(component.pcrs[1].isChecked);
    assert.strictEqual(component.pcrs[1].text, '1.25 Baz');
    assert.ok(component.pcrs[2].isChecked);
    assert.strictEqual(component.pcrs[2].text, '2.1 Foo');
    assert.notOk(component.pcrs[3].isChecked);
    assert.strictEqual(component.pcrs[3].text, '5.55 Bar');
    assert.ok(component.pcrs[4].isChecked);
    assert.strictEqual(component.pcrs[4].text, '15.22 Far');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('add pcrs', async function (assert) {
    assert.expect(3);
    this.set('allPcrses', this.allPcrses);
    this.set('add', (pcrs) => {
      assert.strictEqual(pcrs, this.pcrs4);
    });
    await render(hbs`<SchoolCompetenciesPcrsMapper
      @allPcrses={{this.allPcrses}}
      @selectedPcrses={{(array)}}
      @add={{this.add}}
      @remove={{(noop)}}
    />`);
    assert.notOk(component.pcrs[0].isChecked);
    await component.pcrs[0].click();
  });

  test('remove pcrs', async function (assert) {
    assert.expect(3);
    const selectedPcrses = [this.pcrs4];
    this.set('selectedPcrses', selectedPcrses);
    this.set('allPcrses', this.allPcrses);
    this.set('remove', (pcrs) => {
      assert.strictEqual(pcrs, this.pcrs4);
    });
    await render(hbs`<SchoolCompetenciesPcrsMapper
      @allPcrses={{this.allPcrses}}
      @selectedPcrses={{this.selectedPcrses}}
      @add={{(noop)}}
      @remove={{this.remove}}
    />`);
    assert.ok(component.pcrs[0].isChecked);
    await component.pcrs[0].click();
  });
});
