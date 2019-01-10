import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | school competencies collapsed', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(3);
    let domain = EmberObject.create({title: 'domain 0', isDomain: true, childCount: 1});
    let competency = EmberObject.create({isNotDomain: true, parent: resolve(domain)});
    domain.set('children', resolve([competency]));

    let competencies = [domain, competency];

    const school = EmberObject.create({
      competencies: resolve(competencies)
    });


    this.set('school', school);
    this.set('click', () => {});
    await render(hbs`{{school-competencies-collapsed school=school expand=(action click)}}`);
    const title = '.title';
    const domains = 'table tbody tr';
    const domainTitle = `${domains}:nth-of-type(1) td:nth-of-type(1)`;
    const children = `${domains}:nth-of-type(1) td:nth-of-type(2)`;

    await settled();
    assert.dom(title).hasText('Competencies (1/1)');
    assert.dom(domainTitle).hasText('domain 0');
    assert.dom(children).hasText('There is 1 competency');
  });
});
