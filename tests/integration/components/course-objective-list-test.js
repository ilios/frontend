import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | course objective list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(7);

    const objectives = this.server.createList('objective', 2);
    const course = this.server.create('course', {
      objectives
    });
    const courseModel = await run(() => this.owner.lookup('service:store').find('course', course.id));

    this.set('nothing', () => {});
    this.set('subject', courseModel);

    await render(
      hbs`{{course-objective-list subject=subject manageParents=(action nothing) manageDescriptors=(action nothing)}}`
    );

    assert.ok(findAll('.sort-materials-btn').length, 'Sort Objectives button is visible');
    assert.equal(find('thead th').textContent.trim(), 'Description');
    assert.equal(findAll('thead th')[1].textContent.trim(), 'Parent Objectives');
    assert.equal(findAll('thead th')[2].textContent.trim(), 'MeSH Terms');
    assert.equal(findAll('thead th')[3].textContent.trim(), 'Actions');
    for (let i = 0, n = objectives.length; i < n; i++) {
      assert.equal(find(`tbody tr:nth-of-type(${i + 1}) td`).textContent.trim(), `objective ${i}`);
    }
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    const course = this.server.create('course');
    const courseModel = await run(() => this.owner.lookup('service:store').find('course', course.id));
    this.set('subject', courseModel);
    await render(hbs`{{course-objective-list subject=subject}}`);
    let container = findAll('.course-objective-list');
    assert.equal(container.length, 1, 'Component container element exists.');
    assert.equal(container[0].textContent.trim(), '', 'No content is shown.');
  });

  test('no "sort objectives" button in list with one item', async function(assert) {
    assert.expect(2);
    const objectives = this.server.createList('objective', 1);
    const course = this.server.create('course', {
      objectives
    });
    const courseModel = await run(() => this.owner.lookup('service:store').find('course', course.id));

    this.set('nothing', () => {});
    this.set('subject', courseModel);

    await render(
      hbs`{{course-objective-list subject=subject manageParents=(action nothing) manageDescriptors=(action nothing)}}`
    );
    assert.notOk(findAll('.sort-materials-btn').length, 'Sort button is not visible');
    assert.equal(find('tbody tr:nth-of-type(1) td').textContent.trim(), 'objective 0', 'Objective is visible');
  });
});

