import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('session-objective-list-item', 'Integration | Component | session objective list item', {
  integration: true
});

test('it renders', function(assert) {
  let objective = EmberObject.create({
    title: 'fake title'
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);

  this.render(hbs`{{session-objective-list-item
    objective=objective
    remove=(action 'nothing')
    manageParents=(action 'nothing')
    manageDescriptors=(action 'nothing')
  }}`);

  assert.equal(this.$('td:eq(0)').text().trim(), 'fake title');
  assert.equal(this.$('td:eq(1) button').text().trim(), 'Add New');
  assert.equal(this.$('td:eq(2) button').text().trim(), 'Add New');
  assert.equal(this.$('td:eq(3) i').length, 1);
});

test('renders removable', function(assert) {
  let objective = EmberObject.create({
    title: 'fake title'
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);

  this.render(hbs`{{session-objective-list-item
    objective=objective
    showRemoveConfirmation=true
    remove=(action 'nothing')
    manageParents=(action 'nothing')
    manageDescriptors=(action 'nothing')
  }}`);

  assert.ok(this.$('tr').hasClass('confirm-removal'));
});

test('can change title', async function(assert) {
  let objective = EmberObject.create({
    title: 'fake title',
    save(){
      assert.equal(this.get('title'), '<p>new title</p>');
      return resolve();
    }
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);

  this.render(hbs`{{session-objective-list-item
    objective=objective
    remove=(action 'nothing')
    manageParents=(action 'nothing')
    manageDescriptors=(action 'nothing')
  }}`);

  this.$('td:eq(0) .editable').click();
  this.$('td:eq(0) .fr-box').froalaEditor('html.set', 'new title');
  this.$('td:eq(0) .fr-box').froalaEditor('events.trigger', 'contentChanged');
  this.$('td:eq(0) .done').click();

  await wait();
});

test('can manage parents', function(assert) {
  let objective = EmberObject.create({
    title: 'fake title'
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);
  this.on('something', ()=>{
    assert.ok(true);
  });

  this.render(hbs`{{session-objective-list-item
    objective=objective
    remove=(action 'nothing')
    manageParents=(action 'something')
    manageDescriptors=(action 'nothing')
  }}`);

  this.$('td:eq(1) button').click();

});

test('can manage descriptors', function(assert) {
  let objective = EmberObject.create({
    title: 'fake title'
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);
  this.on('something', ()=>{
    assert.ok(true);
  });

  this.render(hbs`{{session-objective-list-item
    objective=objective
    remove=(action 'nothing')
    manageParents=(action 'nothing')
    manageDescriptors=(action 'something')
  }}`);

  this.$('td:eq(2) button').click();

});

test('can trigger removal', function(assert) {
  let objective = EmberObject.create({
    title: 'fake title'
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);
  this.on('something', ()=>{
    assert.ok(true);
  });

  this.render(hbs`{{session-objective-list-item
    objective=objective
    remove=(action 'something')
    manageParents=(action 'nothing')
    manageDescriptors=(action 'nothing')
  }}`);

  this.$('td:eq(3) i').click();

});
