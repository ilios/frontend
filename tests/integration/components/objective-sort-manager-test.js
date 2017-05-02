import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import { test, skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import tHelper from "ember-i18n/helper";
const { Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('objective-sort-manager', 'Integration | Component | objective sort manager', {

  integration: true,

  beforeEach: function () {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
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

  this.render(hbs`{{objective-sort-manager subject=subject}}`);

  return wait().then(() => {
    assert.equal(this.$('.draggable-object').length, 2);
    assert.equal(this.$('.draggable-object:eq(0)').text().trim(), objective2.get('title'));
    assert.equal(this.$('.draggable-object:eq(1)').text().trim(), objective1.get('title'));
    assert.equal(this.$('.actions .bigadd').length, 1);
    assert.equal(this.$('.actions .bigcancel').length, 1);
  });
});

test('cancel', function(assert) {
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
  this.on('cancel', function(){
    assert.ok(true, 'Cancel action was invoked correctly.');
  });

  this.render(hbs`{{objective-sort-manager subject=subject cancel=(action 'cancel')}}`);

  return wait().then(() => {
    this.$('.actions .bigcancel').click();
  });
});

test('save', function(assert) {
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
  this.on('save', function(data){
    assert.equal(data.length, objectives.length);
    assert.ok(data.contains(objective1));
    assert.ok(data.contains(objective2));
  });

  this.render(hbs`{{objective-sort-manager subject=subject save=(action 'save')}}`);

  return wait().then(() => {
    this.$('.actions .bigadd').click();
  });
});

skip('reorder and save', function(assert) {
  assert.ok(false);
  // @todo figure out how to simulate drag and drop and implement this test [ST 2017/02/13]
});
