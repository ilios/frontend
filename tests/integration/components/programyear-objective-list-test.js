import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | programyear objective list', function(hooks) {
  setupRenderingTest(hooks);

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

    let programYear = EmberObject.create({
      sortedObjectives: resolve(objectives),
    });

    this.set('nothing', () => {});
    this.set('subject', programYear);

    await render(
      hbs`{{programyear-objective-list subject=subject manageCompetency=(action nothing) manageDescriptors=(action nothing) editable=true}}`
    );
    return settled().then(() => {
      assert.ok(findAll('.sort-materials-btn').length, 'Sort Objectives button is visible');
      assert.dom('button.download').exists({ count: 1 }, 'Download button shows.');
      assert.dom(findAll('thead th')[1]).hasText('Description');
      assert.dom(findAll('thead th')[2]).hasText('Competency');
      assert.dom(findAll('thead th')[3]).hasText('MeSH Terms');
      for (let i = 0, n = objectives.length; i < n; i++) {
        let objective = objectives[i];
        assert.dom(`tbody tr:nth-of-type(${i + 1}) td:nth-of-type(2)`).hasText(objective.get('title'));
      }
    });
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    let programYear = EmberObject.create({
      objectives: resolve([]),
    });
    this.set('subject', programYear);
    await render(hbs`{{programyear-objective-list subject=subject}}`);
    let container = findAll('.programyear-objective-list');
    assert.equal(container.length, 1, 'Component container element exists.');
    assert.dom(container[0]).hasText('', 'No content is shown.');
  });

  test('no "sort objectives" button in list with one item', async function(assert) {
    assert.expect(2);
    let objective = EmberObject.create({
      title: 'Objective A',
    });
    let programYear = EmberObject.create({
      sortedObjectives: resolve([ objective ]),
    });

    this.set('nothing', () => {});
    this.set('subject', programYear);

    await render(
      hbs`{{programyear-objective-list subject=subject manageCompetency=(action nothing) manageDescriptors=(action nothing)}}`
    );

    return settled().then(() => {
      assert.notOk(findAll('.sort-materials-btn').length, 'Sort button is not visible');
      assert.dom(findAll('tbody tr:nth-of-type(1) td')[1]).hasText(objective.get('title'), 'Objective is visible');
    });
  });
});
