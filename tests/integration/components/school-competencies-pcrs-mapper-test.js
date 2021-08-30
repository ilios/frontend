import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/school-competencies-pcrs-mapper';

module('Integration | Component | school-competencies-pcrs-mapper', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('aamcPcrs', 5);
    this.allPcrses = await this.owner.lookup('service:store').findAll('aamcPcrs');
  });

  test('it renders', async function (assert) {
    const selectedPcrses = [this.allPcrses.firstObject, this.allPcrses.lastObject];
    this.set('selectedPcrses', selectedPcrses);
    this.set('allPcrses', this.allPcrses);
    await render(hbs`<SchoolCompetenciesPcrsMapper
      @allPcrses={{this.allPcrses}}
      @selectedPcrses={{this.selectedPcrses}}
      @add={{noop}}
      @remove={{noop}}
    />`);
    assert.equal(component.pcrs.length, 5);
    assert.ok(component.pcrs[0].isChecked);
    assert.notOk(component.pcrs[1].isChecked);
    assert.notOk(component.pcrs[2].isChecked);
    assert.notOk(component.pcrs[3].isChecked);
    assert.ok(component.pcrs[4].isChecked);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('add pcrs', async function (assert) {
    assert.expect(3);
    this.set('allPcrses', this.allPcrses);
    this.set('add', (pcrs) => {
      assert.equal(pcrs, this.allPcrses.firstObject);
    });
    await render(hbs`<SchoolCompetenciesPcrsMapper
      @allPcrses={{this.allPcrses}}
      @selectedPcrses={{array}}
      @add={{this.add}}
      @remove={{noop}}
    />`);
    assert.notOk(component.pcrs[0].isChecked);
    await component.pcrs[0].click();
  });

  test('remove pcrs', async function (assert) {
    assert.expect(3);
    const selectedPcrses = [this.allPcrses.firstObject];
    this.set('selectedPcrses', selectedPcrses);
    this.set('allPcrses', this.allPcrses);
    this.set('remove', (pcrs) => {
      assert.equal(pcrs, this.allPcrses.firstObject);
    });
    await render(hbs`<SchoolCompetenciesPcrsMapper
      @allPcrses={{this.allPcrses}}
      @selectedPcrses={{this.selectedPcrses}}
      @add={{noop}}
      @remove={{this.remove}}
    />`);
    assert.ok(component.pcrs[0].isChecked);
    await component.pcrs[0].click();
  });
});
