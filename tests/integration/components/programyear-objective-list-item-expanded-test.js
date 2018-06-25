import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';

module('Integration | Component | programyear-objective-list-item-expanded', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const course1 = {
      id: 1,
      title: 'course 1',
      externalId: 'ABC 123'
    };
    const course2 = {
      id: 2,
      title: 'course 2',
      externalId: null,
    };
    const courseObjective1 = {
      title: 'objective 1',
      courses: resolve([course1])
    };
    const courseObjective2 = {
      title: 'objective 2',
      courses: resolve([course1])
    };
    const courseObjective3 = {
      title: 'objective 3',
      courses: resolve([course2])
    };
    const objective = {
      children: resolve([courseObjective1, courseObjective2, courseObjective3])
    };
    this.set('objective', objective);


    await render(hbs`{{programyear-objective-list-item-expanded objective=objective}}`);

    const rows = 'tr';
    const titles = `${rows}:nth-of-type(1)`;
    const firstCourse = `${rows}:nth-of-type(2)`;
    const firstCourseTitle = `${firstCourse} td:nth-of-type(2)`;
    const firstCourseObjectives = `${firstCourse} td:nth-of-type(3) li`;
    const firstCourseFirstObjective = `${firstCourseObjectives}:nth-of-type(1)`;
    const firstCourseSecondObjective = `${firstCourseObjectives}:nth-of-type(2)`;
    const secondCourse = `${rows}:nth-of-type(3)`;
    const secondCourseTitle = `${secondCourse} td:nth-of-type(2)`;
    const secondCourseObjectives = `${secondCourse} td:nth-of-type(3) li`;
    const secondCourseFirstObjective = `${secondCourseObjectives}:nth-of-type(1)`;


    assert.equal(this.element.querySelectorAll(rows).length, 3);
    assert.ok(this.element.querySelector(titles).textContent.includes('Courses'));
    assert.ok(this.element.querySelector(titles).textContent.includes('Objectives'));
    assert.equal(this.element.querySelector(firstCourseTitle).textContent.trim(), 'course 1 (ABC 123)');
    assert.equal(this.element.querySelectorAll(firstCourseObjectives).length, 2);
    assert.equal(this.element.querySelector(firstCourseFirstObjective).textContent.trim(), 'objective 1');
    assert.equal(this.element.querySelector(firstCourseSecondObjective).textContent.trim(), 'objective 2');

    assert.equal(this.element.querySelector(secondCourseTitle).textContent.trim(), 'course 2');
    assert.equal(this.element.querySelectorAll(secondCourseObjectives).length, 1);
    assert.equal(this.element.querySelector(secondCourseFirstObjective).textContent.trim(), 'objective 3');
  });

  test('it renders empty', async function (assert) {
    const objective = {
      children: resolve([])
    };
    this.set('objective', objective);


    await render(hbs`{{programyear-objective-list-item-expanded objective=objective}}`);

    const rows = 'tr';
    const titles = `${rows}:nth-of-type(1)`;
    const none = `${rows}:nth-of-type(2)`;


    assert.equal(this.element.querySelectorAll(rows).length, 2);
    assert.ok(this.element.querySelector(titles).textContent.includes('Courses'));
    assert.ok(this.element.querySelector(titles).textContent.includes('Objectives'));
    assert.equal(this.element.querySelector(none).textContent.trim(), 'None');
  });
});
