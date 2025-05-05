import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school-competencies-collapsed';
import SchoolCompetenciesCollapsed from 'frontend/components/school-competencies-collapsed';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school competencies collapsed', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const domain = this.server.create('competency', { school });
    const domain2 = this.server.create('competency', { school });
    this.server.create('competency', { school });
    this.server.create('competency', { school, parent: domain2 });
    this.server.createList('competency', 3, { school, parent: domain });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);
    await render(
      <template>
        <SchoolCompetenciesCollapsed @school={{this.school}} @expand={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.title.text, 'Competencies (3/4)');
    assert.strictEqual(component.domains.length, 3);
    assert.strictEqual(component.domains[0].title, 'competency 0');
    assert.strictEqual(component.domains[0].summary, 'There are 3 subcompetencies');
    assert.strictEqual(component.domains[1].title, 'competency 1');
    assert.strictEqual(component.domains[1].summary, 'There is 1 subcompetency');
    assert.strictEqual(component.domains[2].title, 'competency 2');
    assert.strictEqual(component.domains[2].summary, 'There are 0 subcompetencies');
  });

  test('clicking expand fires action', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);
    this.set('expand', () => assert.ok(true));
    await render(
      <template>
        <SchoolCompetenciesCollapsed @school={{this.school}} @expand={{this.expand}} />
      </template>,
    );
    await component.title.click();
  });
});
