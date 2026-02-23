import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/school/competencies-expanded';
import CompetenciesExpanded from 'frontend/components/school/competencies-expanded';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school/competencies-expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const domain = this.server.create('competency', {
      school,
      title: 'domain 0',
    });
    this.server.create('competency', {
      school,
      title: 'competency 0',
      parent: domain,
    });
    this.server.create('competency', {
      school,
      title: 'competency 1',
      parent: domain,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <CompetenciesExpanded
          @school={{this.school}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
          @collapse={{(noop)}}
          @expand={{(noop)}}
          @isManaging={{false}}
          @setSchoolManageCompetencies={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.collapser.text, 'Competencies (1/2)');
    assert.strictEqual(component.competenciesList.items.length, 3);
    assert.strictEqual(component.competenciesList.items[0].title.text, 'domain 0');
    assert.strictEqual(component.competenciesList.items[1].title.text, 'competency 0');
    assert.strictEqual(component.competenciesList.items[2].title.text, 'competency 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders empty', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <CompetenciesExpanded
          @school={{this.school}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
          @collapse={{(noop)}}
          @expand={{(noop)}}
          @isManaging={{false}}
          @setSchoolManageCompetencies={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.competenciesList.isHidden);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
