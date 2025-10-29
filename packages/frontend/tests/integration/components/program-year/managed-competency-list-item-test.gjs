import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/program-year/managed-competency-list-item';
import ManagedCompetencyListItem from 'frontend/components/program-year/managed-competency-list-item';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | program-year/managed-competency-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const domain = this.server.create('competency', { title: 'domain' });
    const competencies = this.server.createList('competency', 2, {
      parent: domain,
    });
    this.domain = await this.owner.lookup('service:store').findRecord('competency', domain.id);
    this.competency1 = await this.owner
      .lookup('service:store')
      .findRecord('competency', competencies[0].id);
    this.competency2 = await this.owner
      .lookup('service:store')
      .findRecord('competency', competencies[1].id);
  });

  test('all competencies selected', async function (assert) {
    this.set('domain', this.domain);
    this.set('competencies', [this.domain, this.competency1, this.competency2]);
    this.set('selectedCompetencies', [this.domain, this.competency1, this.competency2]);
    this.set('competenciesWithSelectedChildren', [this.domain]);

    await render(
      <template>
        <ManagedCompetencyListItem
          @domain={{this.domain}}
          @selectedCompetencies={{this.selectedCompetencies}}
          @competenciesWithSelectedChildren={{this.competenciesWithSelectedChildren}}
          @competencies={{this.competencies}}
          @removeCompetencyFromBuffer={{(noop)}}
          @addCompetencyToBuffer={{(noop)}}
        />
      </template>,
    );

    assert.ok(component.isChecked);
    assert.notOk(component.isIndeterminate);
    assert.strictEqual(component.competencies.length, 2);
    assert.strictEqual(component.competencies[0].text, 'competency 1');
    assert.ok(component.competencies[0].isChecked);
    assert.strictEqual(component.competencies[1].text, 'competency 2');
    assert.ok(component.competencies[1].isChecked);
  });

  test('some competencies selected', async function (assert) {
    this.set('domain', this.domain);
    this.set('competencies', [this.domain, this.competency1, this.competency2]);
    this.set('selectedCompetencies', [this.competency1]);
    this.set('competenciesWithSelectedChildren', [this.domain]);

    await render(
      <template>
        <ManagedCompetencyListItem
          @domain={{this.domain}}
          @selectedCompetencies={{this.selectedCompetencies}}
          @competenciesWithSelectedChildren={{this.competenciesWithSelectedChildren}}
          @competencies={{this.competencies}}
          @removeCompetencyFromBuffer={{(noop)}}
          @addCompetencyToBuffer={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.isChecked);
    assert.ok(component.isIndeterminate);
    assert.strictEqual(component.competencies.length, 2);
    assert.strictEqual(component.competencies[0].text, 'competency 1');
    assert.ok(component.competencies[0].isChecked);
    assert.strictEqual(component.competencies[1].text, 'competency 2');
    assert.notOk(component.competencies[1].isChecked);
  });

  test('no competencies selected', async function (assert) {
    this.set('domain', this.domain);
    this.set('competencies', [this.domain, this.competency1, this.competency2]);

    await render(
      <template>
        <ManagedCompetencyListItem
          @domain={{this.domain}}
          @selectedCompetencies={{(array)}}
          @competenciesWithSelectedChildren={{(array)}}
          @competencies={{this.competencies}}
          @removeCompetencyFromBuffer={{(noop)}}
          @addCompetencyToBuffer={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.isChecked);
    assert.notOk(component.isIndeterminate);
    assert.strictEqual(component.competencies.length, 2);
    assert.strictEqual(component.competencies[0].text, 'competency 1');
    assert.notOk(component.competencies[0].isChecked);
    assert.strictEqual(component.competencies[1].text, 'competency 2');
    assert.notOk(component.competencies[1].isChecked);
  });

  test('add domain', async function (assert) {
    this.set('domain', this.domain);
    this.set('competencies', [this.domain, this.competency1, this.competency2]);
    this.set('add', (competency, children) => {
      assert.step('add called');
      assert.strictEqual(competency, this.domain);
      assert.strictEqual(children.length, 2);
      assert.ok(children.includes(this.competency1));
      assert.ok(children.includes(this.competency2));
    });
    await render(
      <template>
        <ManagedCompetencyListItem
          @domain={{this.domain}}
          @selectedCompetencies={{(array)}}
          @competenciesWithSelectedChildren={{(array)}}
          @competencies={{this.competencies}}
          @removeCompetencyFromBuffer={{(noop)}}
          @addCompetencyToBuffer={{this.add}}
        />
      </template>,
    );

    assert.notOk(component.isChecked);
    await component.click();
    assert.verifySteps(['add called']);
  });

  test('remove domain', async function (assert) {
    this.set('domain', this.domain);
    this.set('competencies', [this.domain, this.competency1, this.competency2]);
    this.set('selectedCompetencies', [this.domain]);
    this.set('remove', (competency, children) => {
      assert.step('remove called');
      assert.strictEqual(competency, this.domain);
      assert.strictEqual(children.length, 2);
      assert.ok(children.includes(this.competency1));
      assert.ok(children.includes(this.competency2));
    });
    await render(
      <template>
        <ManagedCompetencyListItem
          @domain={{this.domain}}
          @selectedCompetencies={{this.selectedCompetencies}}
          @competenciesWithSelectedChildren={{(array)}}
          @competencies={{this.competencies}}
          @removeCompetencyFromBuffer={{this.remove}}
          @addCompetencyToBuffer={{(noop)}}
        />
      </template>,
    );

    assert.ok(component.isChecked);
    await component.click();
    assert.verifySteps(['remove called']);
  });

  test('add sub-competency', async function (assert) {
    this.set('domain', this.domain);
    this.set('competencies', [this.domain, this.competency1, this.competency2]);
    this.set('add', (competency, children) => {
      assert.step('add called');
      assert.strictEqual(competency, this.competency1);
      assert.strictEqual(children.length, 0);
    });
    await render(
      <template>
        <ManagedCompetencyListItem
          @domain={{this.domain}}
          @selectedCompetencies={{(array)}}
          @competenciesWithSelectedChildren={{(array)}}
          @competencies={{this.competencies}}
          @removeCompetencyFromBuffer={{(noop)}}
          @addCompetencyToBuffer={{this.add}}
        />
      </template>,
    );

    assert.notOk(component.competencies[0].isChecked);
    await component.competencies[0].click();
    assert.verifySteps(['add called']);
  });

  test('remove sub-competency', async function (assert) {
    this.set('domain', this.domain);
    this.set('competencies', [this.domain, this.competency1, this.competency2]);
    this.set('selectedCompetencies', [this.domain, this.competency1]);
    this.set('competenciesWithSelectedChildren', [this.domain]);
    this.set('remove', (competency, children) => {
      assert.step('remove called');
      assert.strictEqual(competency, this.competency1);
      assert.strictEqual(children.length, 0);
    });
    await render(
      <template>
        <ManagedCompetencyListItem
          @domain={{this.domain}}
          @selectedCompetencies={{this.selectedCompetencies}}
          @competenciesWithSelectedChildren={{this.competenciesWithSelectedChildren}}
          @competencies={{this.competencies}}
          @removeCompetencyFromBuffer={{this.remove}}
          @addCompetencyToBuffer={{(array)}}
        />
      </template>,
    );

    assert.ok(component.competencies[0].isChecked);
    await component.competencies[0].click();
    assert.verifySteps(['remove called']);
  });
});
