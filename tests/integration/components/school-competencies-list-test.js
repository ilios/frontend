import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/school-competencies-list';

module('Integration | Component | school competencies list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const domain = this.server.create('competency', { title: 'domain 0' });
    this.server.create('competency', { title: 'competency 0', parent: domain });
    this.server.create('competency', { title: 'competency 1', parent: domain });
    const domainModel = await this.owner.lookup('service:store').find('competency', domain.id);

    this.set('domains', [ domainModel ]);
    await render(hbs`<SchoolCompetenciesList @domains={{this.domains}} />`);

    assert.equal(component.domains.length, 1);
    assert.equal(component.domains[0].title, 'domain 0');
    assert.equal(component.domains[0].competencies.length, 2);
    assert.equal(component.domains[0].competencies[0].text, 'competency 0');
    assert.equal(component.domains[0].competencies[1].text, 'competency 1');
  });
});
