import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('instructorgroup-header', 'Integration | Component | instructorgroup header', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(3);
  let instructorGroup = EmberObject.create({
    title: 'lorem ipsum',
    school: {title: 'medicine'},
    users: [{}, {}, {}],
  });

  this.set('instructorGroup', instructorGroup);
  this.render(hbs`{{instructorgroup-header instructorGroup=instructorGroup}}`);

  assert.equal(this.$('.school-title').text().trim(), 'medicine >');
  assert.equal(this.$('.editinplace').text().trim(), 'lorem ipsum');
  assert.equal(this.$('.info').text().replace(/\s/g,''), 'Members:3');
});

test('can change title', function(assert) {
  assert.expect(3);
  let instructorGroup = EmberObject.create({
    title: 'lorem ipsum',
    save(){
      assert.equal(this.get('title'), 'new title');
      return resolve(this);
    }
  });

  this.set('instructorGroup', instructorGroup);
  this.render(hbs`{{instructorgroup-header instructorGroup=instructorGroup}}`);

  assert.equal(this.$('.editinplace').text().trim(), 'lorem ipsum');
  this.$('.editable').click();
  this.$('.editinplace input').val('new title');
  this.$('.editinplace input').trigger('change');
  this.$('.editinplace .done').click();
  return wait().then(() => {
    assert.equal(this.$('.editinplace').text().trim(), 'new title');
  });
});
