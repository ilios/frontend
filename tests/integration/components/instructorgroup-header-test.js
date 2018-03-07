import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
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

    assert.equal(this.$('.school-title').text().trim(), 'medicine >');
    assert.equal(this.$('.editinplace').text().trim(), 'lorem ipsum');
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
    await render(hbs`{{instructorgroup-header instructorGroup=instructorGroup}}`);

    assert.equal(this.$('.editinplace').text().trim(), 'lorem ipsum');
    this.$('.editable').click();
    this.$('.editinplace input').val('new title');
    this.$('.editinplace input').trigger('input');
    this.$('.editinplace .done').click();
    return settled().then(() => {
      assert.equal(this.$('.editinplace').text().trim(), 'new title');
    });
  });
});
