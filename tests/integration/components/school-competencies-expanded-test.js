import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | school competencies expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(5);
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
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

    this.set('school', schoolModel);
    await render(hbs`<SchoolCompetenciesExpanded
      @school={{school}}
      @expand={{noop}}
      @collapse={{noop}}
    />`);

    const title = '.title';
    const domains = '[data-test-domains] > li';
    const domainTitle = `${domains}:nth-of-type(1)`;

    assert.dom(title).hasText('Competencies (1/2)');
    assert.dom(domains).exists({ count: 1 });
    assert.ok(find(domainTitle).textContent.includes('domain 0'));
    assert.ok(find(domainTitle).textContent.includes('competency 0'));
    assert.ok(find(domainTitle).textContent.includes('competency 1'));
  });
});
