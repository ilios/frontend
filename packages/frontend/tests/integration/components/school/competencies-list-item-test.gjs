import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/school/competencies-list-item';
import CompetenciesListItem from 'frontend/components/school/competencies-list-item';

module('Integration | Component | school/competencies-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const pcrs1 = this.server.create('aamc-pcrs', {
      description: 'Zylinder',
    });
    const pcrs2 = this.server.create('aamc-pcrs', {
      description: 'Alfons',
    });
    const domain = this.server.create('competency', {
      aamcPcrses: [pcrs1, pcrs2],
    });
    const competency = this.server.create('competency', {
      parent: domain,
    });
    this.competencyModel = await this.owner
      .lookup('service:store')
      .findRecord('competency', competency.id);
    this.domainModel = await this.owner.lookup('service:store').findRecord('competency', domain.id);
  });

  test('it renders - domain', async function (assert) {
    this.set('competency', this.domainModel);
    await render(
      <template>
        <CompetenciesListItem
          @competency={{this.competency}}
          @isDomain={{true}}
          @canUpdate={{true}}
        />
      </template>,
    );
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
    await render(
      <template>
        <CompetenciesListItem
          @competency={{this.competency}}
          @isDomain={{false}}
          @canUpdate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title.text, 'competency 1');
    assert.ok(component.title.isCompetency);
    assert.notOk(component.title.isDomain);
    assert.strictEqual(component.pcrs.items.length, 1);
    assert.strictEqual(component.pcrs.items[0].text, 'Click to edit');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('manage - no pre-selected PCRS', async function (assert) {
    this.set('competency', this.competencyModel);
    await render(
      <template>
        <CompetenciesListItem
          @competency={{this.competency}}
          @isDomain={{false}}
          @canUpdate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title.text, 'competency 1');
    assert.strictEqual(component.pcrs.items.length, 1);
    assert.strictEqual(component.pcrs.items[0].text, 'Click to edit');
    assert.notOk(component.mapper.isVisible);
    await component.pcrs.items[0].edit();
    assert.ok(component.mapper.isVisible);
    assert.strictEqual(component.mapper.pcrs.length, 2);
    assert.notOk(component.mapper.pcrs[0].isChecked);
    assert.notOk(component.mapper.pcrs[1].isChecked);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('manage - pre-selected PCRS', async function (assert) {
    this.set('competency', this.domainModel);
    await render(
      <template>
        <CompetenciesListItem
          @competency={{this.competency}}
          @isDomain={{false}}
          @canUpdate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title.text, 'competency 0');
    assert.strictEqual(component.pcrs.items.length, 2);
    assert.strictEqual(component.pcrs.items[0].text, '1 Zylinder');
    assert.strictEqual(component.pcrs.items[1].text, '2 Alfons');
    assert.notOk(component.mapper.isVisible);
    await component.pcrs.items[0].edit();
    assert.ok(component.mapper.isVisible);
    assert.strictEqual(component.mapper.pcrs.length, 2);
    assert.ok(component.mapper.pcrs[0].isChecked);
    assert.ok(component.mapper.pcrs[1].isChecked);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
