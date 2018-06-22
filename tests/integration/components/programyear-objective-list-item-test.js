import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('programyear-objective-list-item', 'Integration | Component | programyear objective list item', {
  integration: true
});

test('it renders', function(assert) {
  let objective = EmberObject.create({
    title: 'fake title'
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);

  this.render(hbs`{{programyear-objective-list-item
    objective=objective
    manageDescriptors=(action 'nothing')
    manageCompetency=(action 'nothing')
    toggleExpand=(action 'nothing')
    editable=true
  }}`);

  assert.equal(this.$('td:eq(1)').text().trim(), 'fake title');
  assert.equal(this.$('td:eq(2) button').text().trim(), 'Add New');
  assert.equal(this.$('td:eq(3) button').text().trim(), 'Add New');
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

  this.render(hbs`{{programyear-objective-list-item
    objective=objective
    remove=(action 'nothing')
    manageDescriptors=(action 'nothing')
    manageCompetency=(action 'nothing')
    toggleExpand=(action 'nothing')
    editable=true
  }}`);

  this.$('td:eq(1) .editable').click();
  this.$('td:eq(1) .fr-box').froalaEditor('html.set', 'new title');
  this.$('td:eq(1) .fr-box').froalaEditor('events.trigger', 'contentChanged');
  this.$('td:eq(1) .done').click();

  await wait();
});

test('can manage competency', function(assert) {
  let objective = EmberObject.create({
    title: 'fake title'
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);
  this.on('something', ()=>{
    assert.ok(true);
  });

  this.render(hbs`{{programyear-objective-list-item
    objective=objective
    remove=(action 'nothing')
    manageDescriptors=(action 'nothing')
    manageCompetency=(action 'something')
    toggleExpand=(action 'nothing')
    editable=true
  }}`);

  this.$('td:eq(2) button').click();

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

  this.render(hbs`{{programyear-objective-list-item
    objective=objective
    remove=(action 'nothing')
    manageDescriptors=(action 'something')
    manageCompetency=(action 'nothing')
    toggleExpand=(action 'nothing')
    editable=true
  }}`);

  this.$('td:eq(3) button').click();

});

test('can expand', function(assert) {
  let objective = EmberObject.create({
    title: 'fake title'
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);
  this.on('something', ()=>{
    assert.ok(true);
  });

  this.render(hbs`{{programyear-objective-list-item
    objective=objective
    remove=(action 'nothing')
    manageDescriptors=(action 'nothing')
    manageCompetency=(action 'nothing')
    toggleExpand=(action 'something')
    editable=true
  }}`);

  this.$('td:eq(0)').click();

});
