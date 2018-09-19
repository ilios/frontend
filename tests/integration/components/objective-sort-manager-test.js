import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  findAll
} from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
const { resolve } = RSVP;

module('Integration | Component | objective sort manager', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:i18n').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('it renders', async function(assert) {
    assert.expect(5);

    let objective1 = EmberObject.create({
      title: 'Objective 1',
      position: 1,
    });

    let objective2 = EmberObject.create({
      title: 'Objective 2',
      position: 0
    });

    let subject = EmberObject.create({
      objectives: resolve([ objective1, objective2 ])
    });

    this.set('subject', subject);

    await render(hbs`{{objective-sort-manager subject=subject}}`);

    return settled().then(() => {
      assert.dom('.draggable-object').exists({ count: 2 });
      assert.dom('.draggable-object').hasText(objective2.get('title'));
      assert.dom(findAll('.draggable-object')[1]).hasText(objective1.get('title'));
      assert.dom('.actions .bigadd').exists({ count: 1 });
      assert.dom('.actions .bigcancel').exists({ count: 1 });
    });
  });

  test('cancel', async function(assert) {
    assert.expect(1);
    let subject = EmberObject.create({
      objectives: resolve([
        EmberObject.create({
          title: 'Objective A',
          position: 1,
        }),
        EmberObject.create({
          title: 'Objective B',
          position: 2
        })
      ]),
    });
    this.set('subject', subject);
    this.set('cancel', () => {
      assert.ok(true, 'Cancel action was invoked correctly.');
    });

    await render(hbs`{{objective-sort-manager subject=subject cancel=(action cancel)}}`);

    return settled().then(async () => {
      await click('.actions .bigcancel');
    });
  });

  test('save', async function(assert) {
    assert.expect(3);

    let objective1 = EmberObject.create({
      title: 'Objective1',
      position: 0
    });

    let objective2 = EmberObject.create({
      title: 'Objective2',
      position: 0
    });

    let objectives = [ objective1, objective2 ];

    let subject = EmberObject.create({
      objectives: resolve(objectives),
    });
    this.set('subject', subject);
    this.set('save', data => {
      assert.equal(data.length, objectives.length);
      assert.ok(data.includes(objective1));
      assert.ok(data.includes(objective2));
    });

    await render(hbs`{{objective-sort-manager subject=subject save=(action save)}}`);

    return settled().then(async () => {
      await click('.actions .bigadd');
    });
  });

  skip('reorder and save', function(assert) {
    assert.ok(false);
    // @todo figure out how to simulate drag and drop and implement this test [ST 2017/02/13]
  });
});
