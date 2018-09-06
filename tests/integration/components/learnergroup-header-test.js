import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, fillIn, find, findAll, triggerEvent } from '@ember/test-helpers';
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

    assert.equal(find('h2').textContent.trim(), 'our group');
    assert.equal(find('.breadcrumbs').textContent.replace(/\s/g,''), 'LearnerGroupsparentgroupourgroup');
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

    assert.equal(find('h2').textContent.trim(), 'our group');
    await click('h2 .editable');
    await fillIn('h2 input', 'new title');
    await triggerEvent('h2 input', 'input');
    await click('h2 .done');
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

    assert.equal(find('header .info').textContent.trim(), 'Members:  1 / 2');
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

    assert.equal(find(title).textContent.trim(), 'our group', 'title is correct');
    assert.equal(findAll(errors).length, 0, 'there are no errors');
    await click(edit);
    const longTitle = 'x'.repeat(61);
    await fillIn(input, longTitle);
    await click(done);
    await settled();
    assert.equal(findAll(errors).length, 1, 'there is now an error');
    assert.ok(find(errors).textContent.search(/too long/) > -1, 'it is the correct error');
  });
});
