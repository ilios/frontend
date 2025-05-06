import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/program-year/competency-list-item';
import CompetencyListItem from 'frontend/components/program-year/competency-list-item';
import { array } from '@ember/helper';

module('Integration | Component | program-year/competency-list-item', function (hooks) {
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

  test('it renders', async function (assert) {
    this.set('domain', this.domain);
    this.set('selectedCompetencies', [this.domain, this.competency1, this.competency2]);
    this.set('competencies', [this.domain, this.competency1, this.competency2]);

    await render(
      <template>
        <CompetencyListItem
          @domain={{this.domain}}
          @selectedCompetencies={{this.selectedCompetencies}}
          @competencies={{this.competencies}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'domain');
    assert.ok(component.isActive);
    assert.strictEqual(component.competencies.length, 2);
    assert.strictEqual(component.competencies[0].text, 'competency 1');
    assert.strictEqual(component.competencies[1].text, 'competency 2');
  });

  test('inactive domain, no selected competencies', async function (assert) {
    this.set('domain', this.domain);
    this.set('competencies', [this.domain, this.competency1, this.competency2]);
    await render(
      <template>
        <CompetencyListItem
          @domain={{this.domain}}
          @selectedCompetencies={{(array)}}
          @competencies={{this.competencies}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'domain');
    assert.notOk(component.isActive);
    assert.strictEqual(component.competencies.length, 0);
  });
});
