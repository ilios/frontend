import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

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
  assert.equal(this.$('[data-test-group-title]').text().trim(), 'lorem ipsum');
  assert.equal(this.$('.info').text().replace(/\s/g,''), 'Members:3');
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
  this.render(hbs`{{instructorgroup-header instructorGroup=instructorGroup canUpdate=true}}`);

  assert.equal(this.$('[data-test-group-title]').text().trim(), 'lorem ipsum');
  this.$('.editable').click();
  this.$('[data-test-group-title] input').val('new title');
  this.$('[data-test-group-title] input').trigger('input');
  this.$('[data-test-group-title] .done').click();

  await wait();
  assert.equal(this.$('[data-test-group-title]').text().trim(), 'new title');
});
