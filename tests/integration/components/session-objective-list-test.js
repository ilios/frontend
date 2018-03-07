import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | session objective list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    assert.expect(7);

    let objective1 = EmberObject.create({
      title: 'Objective A',
      position: 0
    });

    let objective2 = EmberObject.create({
      title: 'Objective B',
      position: 0
    });

    let objectives = [ objective1, objective2 ];

    let session = EmberObject.create({
      sortedObjectives: resolve(objectives),
    });

    this.actions.nothing = parseInt;
    this.set('subject', session);

    await render(
      hbs`{{session-objective-list editable=true subject=subject manageParents=(action 'nothing') manageDescriptors=(action 'nothing')}}`
    );
    return settled().then(() => {
      assert.ok(findAll('.sort-materials-btn').length, 'Sort Objectives button is visible');
      assert.equal(find('thead th').textContent.trim(), 'Description');
      assert.equal(find(findAll('thead th')[1]).textContent.trim(), 'Parent Objectives');
      assert.equal(find(findAll('thead th')[2]).textContent.trim(), 'MeSH Terms');
      assert.equal(find(findAll('thead th')[3]).textContent.trim(), 'Actions');
      for (let i = 0, n = objectives.length; i < n; i++) {
        let objective = objectives[i];
        assert.equal(this.$(`tbody tr:eq(${i}) td:eq(0)`).text().trim(), objective.get('title'));
      }
    });
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    let session = EmberObject.create({
      objectives: resolve([]),
    });
    this.set('subject', session);
    await render(hbs`{{session-objective-list subject=subject}}`);
    return settled().then(() => {
      let container = this.$('.session-objective-list');
      assert.equal(container.length, 1, 'Component container element exists.');
      assert.equal(container.text().trim(), '', 'No content is shown.');
    });
  });

  test('no "sort objectives" button in list with one item', async function(assert) {
    assert.expect(2);
    let objective = EmberObject.create({
      title: 'Objective A',
    });
    let session = EmberObject.create({
      sortedObjectives: resolve([ objective ]),
    });

    this.actions.nothing = parseInt;
    this.set('subject', session);

    await render(
      hbs`{{session-objective-list editable=true subject=subject manageParents=(action 'nothing') manageDescriptors=(action 'nothing')}}`
    );

    return settled().then(() => {
      assert.notOk(findAll('.sort-materials-btn').length, 'Sort button is not visible');
      assert.equal(find('tbody tr:eq(0) td').textContent.trim(), objective.get('title'), 'Objective is visible');
    });
  });
});


