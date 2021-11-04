import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/course-search-result';

module('Integration | Component | course-search-result', function (hooks) {
  setupRenderingTest(hooks);

  test('it display course and session info properly', async function (assert) {
    assert.expect(9);

    const course = {
      id: 1,
      title: 'Course 1',
      school: 'Medicine',
      year: '1980',
      sessions: [
        {
          id: 1,
          title: 'Session 1',
        },
        {
          id: 2,
          title: 'Session 2',
        },
        {
          id: 3,
          title: 'Session 3',
        },
        {
          id: 4,
          title: 'Session 4',
        },
      ],
    };
    this.set('course', course);
    await render(hbs`<CourseSearchResult @course={{course}} />`);
    assert.strictEqual(component.courseTitle, '1980 Course 1');
    assert.strictEqual(component.schoolTitle, 'Medicine');
    assert.strictEqual(component.sessions[0].text, 'Session 1');
    assert.strictEqual(component.sessions[1].text, 'Session 2');
    assert.strictEqual(component.sessions[2].text, 'Session 3');
    assert.strictEqual(component.sessions.length, 3);
    assert.ok(component.showMoreIsVisible);
    await component.showMore();
    assert.strictEqual(component.sessions[3].text, 'Session 4');
    assert.strictEqual(component.sessions.length, 4);
  });
});
