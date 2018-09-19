import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | school session types collapsed', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(5);
    const instructionalMethod = EmberObject.create({
      assessment: false
    });
    const assessmentMethod = EmberObject.create({
      assessment: true
    });

    const school = EmberObject.create({
      sessionTypes: resolve([instructionalMethod, assessmentMethod])
    });


    this.set('school', school);
    this.set('click', () => {});
    await render(hbs`{{school-session-types-collapsed school=school expand=(action click)}}`);

    await settled();
    const title = '.title';
    const table = 'table';
    const assessmentMethodRow = `${table} tbody tr:nth-of-type(1)`;
    const instructionalMethodRow = `${table} tbody tr:nth-of-type(2)`;
    const assessmentTitle = `${assessmentMethodRow} td:nth-of-type(1)`;
    const assessmentCount = `${assessmentMethodRow} td:nth-of-type(2)`;
    const instructionalTitle = `${instructionalMethodRow} td:nth-of-type(1)`;
    const instructionalCount = `${instructionalMethodRow} td:nth-of-type(2)`;

    assert.dom(title).hasText('Session Types');
    assert.dom(assessmentTitle).hasText('Assessment Methods');
    assert.dom(assessmentCount).hasText('1');
    assert.dom(instructionalTitle).hasText('Instructional Methods');
    assert.dom(instructionalCount).hasText('1');

  });
});
