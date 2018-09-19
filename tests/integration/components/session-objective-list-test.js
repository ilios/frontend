import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | session objective list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(7);

    let objective1 = EmberObject.create({
      title: 'Objective A',
      position: 0,
      hasMany() {
        return {
          ids() {
            return [];
          }
        };
      }
    });

    let objective2 = EmberObject.create({
      title: 'Objective B',
      position: 0,
      hasMany() {
        return {
          ids() {
            return [];
          }
        };
      }
    });

    let objectives = [ objective1, objective2 ];

    let session = EmberObject.create({
      sortedObjectives: resolve(objectives),
    });

    this.set('nothing', () => {});
    this.set('subject', session);

    await render(
      hbs`{{session-objective-list editable=true subject=subject manageParents=(action nothing) manageDescriptors=(action nothing)}}`
    );
    assert.ok(findAll('.sort-materials-btn').length, 'Sort Objectives button is visible');
    assert.dom('thead th').hasText('Description');
    assert.dom(findAll('thead th')[1]).hasText('Parent Objectives');
    assert.dom(findAll('thead th')[2]).hasText('MeSH Terms');
    assert.dom(findAll('thead th')[3]).hasText('Actions');
    for (let i = 0, n = objectives.length; i < n; i++) {
      let objective = objectives[i];
      assert.dom(`tbody tr:nth-of-type(${i + 1}) td:nth-of-type(1)`).hasText(objective.get('title'));
    }
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    let session = EmberObject.create({
      objectives: resolve([]),
    });
    this.set('subject', session);
    await render(hbs`{{session-objective-list subject=subject}}`);
    let container = findAll('.session-objective-list');
    assert.equal(container.length, 1, 'Component container element exists.');
    assert.dom(container[0]).hasText('', 'No content is shown.');
  });

  test('no "sort objectives" button in list with one item', async function(assert) {
    assert.expect(2);
    let objective = EmberObject.create({
      title: 'Objective A',
      hasMany() {
        return {
          ids() {
            return [];
          }
        };
      }
    });
    let session = EmberObject.create({
      sortedObjectives: resolve([ objective ]),
    });

    this.set('nothing', () => {});
    this.set('subject', session);

    await render(
      hbs`{{session-objective-list editable=true subject=subject manageParents=(action nothing) manageDescriptors=(action nothing)}}`
    );

    return settled().then(() => {
      assert.notOk(findAll('.sort-materials-btn').length, 'Sort button is not visible');
      assert.dom('tbody tr:nth-of-type(1) td').hasText(objective.get('title'), 'Objective is visible');
    });
  });
});


