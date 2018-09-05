import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | school competencies list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);
    let domain = EmberObject.create({title: 'domain 0', isDomain: true, childCount: 1});
    let competency1 = EmberObject.create({title: 'competency 0', isNotDomain: true, parent: resolve(domain)});
    let competency2 = EmberObject.create({title: 'competency 1', isNotDomain: true, parent: resolve(domain)});
    domain.set('children', resolve([competency1, competency2]));

    let domainsList = [domain];

    this.set('domains', domainsList);
    await render(hbs`{{school-competencies-list domains=domains}}`);
    const domains = '[data-test-domains] > li';
    const domainTitle = `${domains}:eq(0)`;

    await settled();
    assert.equal(this.$(domains).length, 1);
    assert.ok(this.$(domainTitle).text().includes('domain 0'));
    assert.ok(this.$(domainTitle).text().includes('competency 0'));
    assert.ok(this.$(domainTitle).text().includes('competency 1'));

  });
});
