import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | course objective list', function(hooks) {
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

    let course = EmberObject.create({
      sortedObjectives: resolve(objectives),
    });

    this.set('nothing', () => {});
    this.set('subject', course);

    await render(
      hbs`{{course-objective-list subject=subject manageParents=(action nothing) manageDescriptors=(action nothing)}}`
    );

    assert.ok(findAll('.sort-materials-btn').length, 'Sort Objectives button is visible');
    assert.equal(find('thead th').textContent.trim(), 'Description');
    assert.equal(findAll('thead th')[1].textContent.trim(), 'Parent Objectives');
    assert.equal(findAll('thead th')[2].textContent.trim(), 'MeSH Terms');
    assert.equal(findAll('thead th')[3].textContent.trim(), 'Actions');
    for (let i = 0, n = objectives.length; i < n; i++) {
      let objective = objectives[i];
      assert.equal(find(`tbody tr:nth-of-type(${i + 1}) td`).textContent.trim(), objective.get('title'));
    }
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    let course = EmberObject.create({
      objectives: resolve([]),
    });
    this.set('subject', course);
    await render(hbs`{{course-objective-list subject=subject}}`);
    let container = findAll('.course-objective-list');
    assert.equal(container.length, 1, 'Component container element exists.');
    assert.equal(container[0].textContent.trim(), '', 'No content is shown.');
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
    let course = EmberObject.create({
      sortedObjectives: resolve([ objective ]),
    });

    this.set('nothing', () => {});
    this.set('subject', course);

    await render(
      hbs`{{course-objective-list subject=subject manageParents=(action nothing) manageDescriptors=(action nothing)}}`
    );
    assert.notOk(findAll('.sort-materials-btn').length, 'Sort button is not visible');
    assert.equal(find('tbody tr:nth-of-type(1) td').textContent.trim(), objective.get('title'), 'Objective is visible');
  });
});

