import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('programyear-objective-list-item', 'Integration | Component | programyear objective list item', {
  integration: true
});

test('it renders', function(assert) {
  let objective = Object.create({
    title: 'fake title'
  });
  this.set('objective', objective);
  this.on('nothing', parseInt);

  this.render(hbs`{{programyear-objective-list-item
    objective=objective
    manageDescriptors=(action 'nothing')
    manageCompetency=(action 'nothing')
  }}`);

  assert.equal(this.$('td:eq(0)').text().trim(), 'fake title');
  assert.equal(this.$('td:eq(1) button').text().trim(), 'Add New');
  assert.equal(this.$('td:eq(2) button').text().trim(), 'Add New');
});


test('can change title', function(assert) {
  let objective = Object.create({
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
  }}`);

  this.$('td:eq(0) .editable').click();
  this.$('td:eq(0) .froalaEditor').froalaEditor('html.set', 'new title');
  this.$('td:eq(0) .froalaEditor').froalaEditor('events.trigger', 'contentChanged');
  this.$('td:eq(0) .done').click();

});

test('can manage competency', function(assert) {
  let objective = Object.create({
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
  }}`);

  this.$('td:eq(1) button').click();

});

test('can manage descriptors', function(assert) {
  let objective = Object.create({
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
  }}`);

  this.$('td:eq(2) button').click();

});
