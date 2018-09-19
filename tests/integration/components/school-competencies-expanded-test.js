import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | school competencies expanded', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(6);
    let domain = EmberObject.create({title: 'domain 0', isDomain: true, childCount: 1});
    let competency1 = EmberObject.create({title: 'competency 0', isNotDomain: true, parent: resolve(domain)});
    let competency2 = EmberObject.create({title: 'competency 1', isNotDomain: true, parent: resolve(domain)});
    domain.set('children', resolve([competency1, competency2]));

    let competencies = [domain, competency1, competency2];

    const school = EmberObject.create({
      competencies: resolve(competencies),
      hasMany(what) {
        assert.equal(what, 'competencies');
        return {
          ids(){
            return [1, 2, 3];
          }
        };
      }
    });

    this.set('school', school);
    this.set('nothing', () => { });
    await render(
      hbs`{{school-competencies-expanded school=school expand=(action nothing) collapse=(action nothing)}}`
    );

    const title = '.title';
    const domains = '[data-test-domains] > li';
    const domainTitle = `${domains}:nth-of-type(1)`;

    await settled();
    assert.dom(title).hasText('Competencies (1/2)');
    assert.dom(domains).exists({ count: 1 });
    assert.ok(find(domainTitle).textContent.includes('domain 0'));
    assert.ok(find(domainTitle).textContent.includes('competency 0'));
    assert.ok(find(domainTitle).textContent.includes('competency 1'));
  });
});
