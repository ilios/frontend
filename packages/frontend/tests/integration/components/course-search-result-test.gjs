import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/course-search-result';
import CourseSearchResult from 'frontend/components/course-search-result';

module('Integration | Component | course-search-result', function (hooks) {
  setupRenderingTest(hooks);

  test('it display course and session info properly', async function (assert) {
    const course = {
      id: 1,
      title: 'Course 1',
      school: 'Medicine',
      year: '1980',
      sessions: [
        {
          id: 1,
          title: 'Session 1',
          matchedIn: ['title'],
        },
        {
          id: 2,
          title: 'Session 2',
          matchedIn: ['title'],
        },
        {
          id: 3,
          title: 'Session 3',
          matchedIn: [],
        },
        {
          id: 4,
          title: 'Session 4',
          matchedIn: ['title'],
        },
        {
          id: 4,
          title: 'Session 5',
          matchedIn: ['title'],
        },
      ],
    };
    this.set('course', course);
    await render(<template><CourseSearchResult @course={{this.course}} /></template>);
    assert.strictEqual(component.courseTitle, '1980 Course 1');
    assert.strictEqual(component.schoolTitle, 'Medicine');
    assert.strictEqual(component.sessions[0].text, 'Session 1');
    assert.strictEqual(component.sessions[1].text, 'Session 2');
    assert.strictEqual(component.sessions[2].text, 'Session 4');
    assert.strictEqual(component.sessions.length, 3);

    assert.notOk(component.showLessIsVisible);
    assert.ok(component.showMoreIsVisible);
    await component.showMore();

    assert.ok(component.showLessIsVisible);
    assert.notOk(component.showMoreIsVisible);
    assert.strictEqual(component.sessions[3].text, 'Session 5');
    assert.strictEqual(component.sessions.length, 4);

    await component.showLess();
    assert.notOk(component.showLessIsVisible);
    assert.ok(component.showMoreIsVisible);
    assert.strictEqual(component.sessions.length, 3);
  });

  test('no show more link when sessions are filtered out', async function (assert) {
    const course = {
      id: 1,
      title: 'Course 1',
      school: 'Medicine',
      year: '1980',
      sessions: [
        {
          id: 1,
          title: 'Session 1',
          matchedIn: ['title'],
        },
        {
          id: 2,
          title: 'Session 2',
          matchedIn: ['title'],
        },
        {
          id: 3,
          title: 'Session 3',
          matchedIn: [],
        },
        {
          id: 4,
          title: 'Session 4',
          matchedIn: ['title'],
        },
      ],
    };
    this.set('course', course);
    await render(<template><CourseSearchResult @course={{this.course}} /></template>);
    assert.strictEqual(component.courseTitle, '1980 Course 1');
    assert.strictEqual(component.schoolTitle, 'Medicine');
    assert.strictEqual(component.sessions[0].text, 'Session 1');
    assert.strictEqual(component.sessions[1].text, 'Session 2');
    assert.strictEqual(component.sessions[2].text, 'Session 4');
    assert.strictEqual(component.sessions.length, 3);

    assert.notOk(component.showLessIsVisible);
    assert.notOk(component.showMoreIsVisible);
  });
});
