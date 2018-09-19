import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  fillIn,
  find,
  triggerEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | instructorgroup header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(3);
    let instructorGroup = EmberObject.create({
      title: 'lorem ipsum',
      school: {title: 'medicine'},
      users: [{}, {}, {}],
    });

    this.set('instructorGroup', instructorGroup);
    await render(hbs`{{instructorgroup-header instructorGroup=instructorGroup}}`);

    assert.dom('.school-title').hasText('medicine >');
    assert.dom('[data-test-group-title]').hasText('lorem ipsum');
    assert.equal(find('.info').textContent.replace(/\s/g,''), 'Members:3');
  });

  test('can change title', async function(assert) {
    assert.expect(3);
    let instructorGroup = EmberObject.create({
      title: 'lorem ipsum',
      save(){
        assert.equal(this.get('title'), 'new title');
        return resolve(this);
      }
    });

    this.set('instructorGroup', instructorGroup);
    await render(hbs`{{instructorgroup-header instructorGroup=instructorGroup canUpdate=true}}`);

    assert.dom('[data-test-group-title]').hasText('lorem ipsum');
    await click('.editable');
    await fillIn('[data-test-group-title] input', 'new title');
    await triggerEvent('[data-test-group-title] input', 'input');
    await click('[data-test-group-title] .done');

    await settled();
    assert.dom('[data-test-group-title]').hasText('new title');
  });
});
