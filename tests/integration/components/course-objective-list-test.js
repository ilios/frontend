import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
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
    return settled().then(() => {
      assert.ok(this.$('.sort-materials-btn').length, 'Sort Objectives button is visible');
      assert.equal(this.$('thead th:eq(0)').text().trim(), 'Description');
      assert.equal(this.$('thead th:eq(1)').text().trim(), 'Parent Objectives');
      assert.equal(this.$('thead th:eq(2)').text().trim(), 'MeSH Terms');
      assert.equal(this.$('thead th:eq(3)').text().trim(), 'Actions');
      for (let i = 0, n = objectives.length; i < n; i++) {
        let objective = objectives[i];
        assert.equal(this.$(`tbody tr:eq(${i}) td:eq(0)`).text().trim(), objective.get('title'));
      }
    });
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    let course = EmberObject.create({
      objectives: resolve([]),
    });
    this.set('subject', course);
    await render(hbs`{{course-objective-list subject=subject}}`);
    return settled().then(() => {
      let container = this.$('.course-objective-list');
      assert.equal(container.length, 1, 'Component container element exists.');
      assert.equal(container.text().trim(), '', 'No content is shown.');
    });
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

    return settled().then(() => {
      assert.notOk(this.$('.sort-materials-btn').length, 'Sort button is not visible');
      assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), objective.get('title'), 'Objective is visible');
    });
  });
});

