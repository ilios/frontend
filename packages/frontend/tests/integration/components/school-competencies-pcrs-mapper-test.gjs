import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/school-competencies-pcrs-mapper';
import SchoolCompetenciesPcrsMapper from 'frontend/components/school-competencies-pcrs-mapper';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | school-competencies-pcrs-mapper', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const pcrs1 = this.server.create('aamc-pcrs', {
      id: 'aamc-pcrs-comp-c0201',
      description: 'Foo',
    });
    const pcrs2 = this.server.create('aamc-pcrs', {
      id: 'aamc-pcrs-comp-c0555',
      description: 'Bar',
    });
    const pcrs3 = this.server.create('aamc-pcrs', {
      id: 'aamc-pcrs-comp-c0125',
      description: 'Baz',
    });
    const pcrs4 = this.server.create('aamc-pcrs', {
      id: 'aamc-pcrs-comp-c0033',
      description: 'Fiz',
    });
    const pcrs5 = this.server.create('aamc-pcrs', {
      id: 'aamc-pcrs-comp-c1522',
      description: 'Far',
    });
    this.pcrs1 = await this.owner.lookup('service:store').findRecord('aamc-pcrs', pcrs1.id);
    this.pcrs2 = await this.owner.lookup('service:store').findRecord('aamc-pcrs', pcrs2.id);
    this.pcrs3 = await this.owner.lookup('service:store').findRecord('aamc-pcrs', pcrs3.id);
    this.pcrs4 = await this.owner.lookup('service:store').findRecord('aamc-pcrs', pcrs4.id);
    this.pcrs5 = await this.owner.lookup('service:store').findRecord('aamc-pcrs', pcrs5.id);
    this.allPcrses = [this.pcrs1, this.pcrs2, this.pcrs3, this.pcrs4, this.pcrs5];
  });

  test('it renders', async function (assert) {
    const selectedPcrses = [this.pcrs1, this.pcrs5];
    this.set('selectedPcrses', selectedPcrses);
    this.set('allPcrses', this.allPcrses);

    await render(
      <template>
        <SchoolCompetenciesPcrsMapper
          @allPcrses={{this.allPcrses}}
          @selectedPcrses={{this.selectedPcrses}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

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
    this.set('allPcrses', this.allPcrses);
    this.set('add', (pcrs) => {
      assert.step('add called');
      assert.strictEqual(pcrs, this.pcrs4);
    });
    await render(
      <template>
        <SchoolCompetenciesPcrsMapper
          @allPcrses={{this.allPcrses}}
          @selectedPcrses={{(array)}}
          @add={{this.add}}
          @remove={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.pcrs[0].isChecked);
    await component.pcrs[0].click();
    assert.verifySteps(['add called', 'add called']);
  });

  test('remove pcrs', async function (assert) {
    const selectedPcrses = [this.pcrs4];
    this.set('selectedPcrses', selectedPcrses);
    this.set('allPcrses', this.allPcrses);
    this.set('remove', (pcrs) => {
      assert.step('remove called');
      assert.strictEqual(pcrs, this.pcrs4);
    });
    await render(
      <template>
        <SchoolCompetenciesPcrsMapper
          @allPcrses={{this.allPcrses}}
          @selectedPcrses={{this.selectedPcrses}}
          @add={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    assert.ok(component.pcrs[0].isChecked);
    await component.pcrs[0].click();
    assert.verifySteps(['remove called', 'remove called']);
  });
});
