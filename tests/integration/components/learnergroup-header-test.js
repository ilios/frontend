import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | learnergroup header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let learnerGroup = EmberObject.create({
      title: 'our group',
      allParents: resolve([{title: 'parent group'}])
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`{{learnergroup-header learnerGroup=learnerGroup}}`);

    assert.equal(this.$('h2').text().trim(), 'our group');
    assert.equal(this.$('.breadcrumbs').text().replace(/\s/g,''), 'LearnerGroupsparentgroupourgroup');
  });

  test('can change title', async function(assert) {
    let learnerGroup = EmberObject.create({
      title: 'our group',
      save(){
        assert.equal(this.get('title'), 'new title');
      }
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`{{learnergroup-header learnerGroup=learnerGroup canUpdate=true}}`);

    assert.equal(this.$('h2').text().trim(), 'our group');
    this.$('h2 .editable').click();
    this.$('h2 input').val('new title');
    this.$('h2 input').trigger('input');
    this.$('h2 .done').click();
    await settled();
  });

  test('counts members correctly', async function(assert) {
    let cohort = EmberObject.create({
      title: 'test group',
      users: [1, 2]
    });
    let subGroup = EmberObject.create({
      title: 'test sub-group',
      users: [],
      children: [],
    });
    let learnerGroup = EmberObject.create({
      title: 'test group',
      usersOnlyAtThisLevel: [1],
      cohort,
      children: resolve([subGroup])
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`{{learnergroup-header learnerGroup=learnerGroup}}`);

    assert.equal(this.$('header .info').text().trim(), 'Members:  1 / 2');
  });

  test('validate title length', async function(assert) {
    assert.expect(4);
    const title = 'h2';
    const edit = `${title} .editable`;
    const input = `${title} input`;
    const done = `${title} .done`;
    const errors = `${title} .validation-error-message`;

    let learnerGroup = EmberObject.create({
      title: 'our group',
      save(){
        assert.ok(false, 'should not be called');
      }
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`{{learnergroup-header learnerGroup=learnerGroup canUpdate=true}}`);

    assert.equal(this.$(title).text().trim(), 'our group', 'title is correct');
    assert.equal(this.$(errors).length, 0, 'there are no errors');
    this.$(edit).click();
    const longTitle = 'x'.repeat(61);
    this.$(input).val(longTitle).trigger('input');
    this.$(done).click();
    await settled();
    assert.equal(this.$(errors).length, 1, 'there is now an error');
    assert.ok(this.$(errors).text().search(/too long/) > -1, 'it is the correct error');
  });
});
