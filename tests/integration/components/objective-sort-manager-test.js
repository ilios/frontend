import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
const { resolve } = RSVP;

module('Integration | Component | objective sort manager', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

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
      assert.equal(this.$('.draggable-object').length, 2);
      assert.equal(this.$('.draggable-object:eq(0)').text().trim(), objective2.get('title'));
      assert.equal(this.$('.draggable-object:eq(1)').text().trim(), objective1.get('title'));
      assert.equal(this.$('.actions .bigadd').length, 1);
      assert.equal(this.$('.actions .bigcancel').length, 1);
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
    this.actions.cancel = function(){
      assert.ok(true, 'Cancel action was invoked correctly.');
    };

    await render(hbs`{{objective-sort-manager subject=subject cancel=(action 'cancel')}}`);

    return settled().then(() => {
      this.$('.actions .bigcancel').click();
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
    this.actions.save = function(data){
      assert.equal(data.length, objectives.length);
      assert.ok(data.includes(objective1));
      assert.ok(data.includes(objective2));
    };

    await render(hbs`{{objective-sort-manager subject=subject save=(action 'save')}}`);

    return settled().then(() => {
      this.$('.actions .bigadd').click();
    });
  });

  skip('reorder and save', function(assert) {
    assert.ok(false);
    // @todo figure out how to simulate drag and drop and implement this test [ST 2017/02/13]
  });
});