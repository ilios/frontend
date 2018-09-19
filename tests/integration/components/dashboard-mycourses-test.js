import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

let mockCourses = [
  EmberObject.create({
    title: 'first',
    level: 4,
    academicYear: '2012-2013',
    locked: false,
    archived: false,
    externalId: 'ABC123'
  }),
  EmberObject.create({
    title: 'second',
    level: 1,
    academicYear: '2013-2014',
    locked: false,
    archived: false,
    externalId: null
  }),
  EmberObject.create({
    title: 'third',
    level: 1,
    academicYear: '2012-2013',
    locked: false,
    archived: false,
    externalId: null

  }),
];

let currentUserMock = Service.extend({
  performsNonLearnerFunction: true,
  activeRelatedCoursesInThisYearAndLastYear: resolve(mockCourses),
});

let currentUserMockNoCourses = Service.extend({
  performsNonLearnerFunction: true,
  activeRelatedCoursesInThisYearAndLastYear: resolve([]),
});

let currentUserMockUnprivileged = Service.extend({
  performsNonLearnerFunction: false,
  activeRelatedCoursesInThisYearAndLastYear: resolve(mockCourses),
});

module('Integration | Component | dashboard mycourses', function(hooks) {
  setupRenderingTest(hooks);

  test('list courses for privileged users', async function(assert) {
    assert.expect(10);
    this.owner.register('service:currentUser', currentUserMock);
    await render(hbs`{{dashboard-mycourses}}`);

    const header = '.dashboard-block-header';
    const allLinks = `table a`;
    const courses = `table tr`;
    const firstCourse = `${courses}:nth-of-type(1)`;
    const firstCourseYear = `${firstCourse} td:nth-of-type(1)`;
    const firstCourseTitle = `${firstCourse} td:nth-of-type(2)`;
    const secondCourse = `${courses}:nth-of-type(2)`;
    const secondCourseYear = `${secondCourse} td:nth-of-type(1)`;
    const secondCourseTitle = `${secondCourse} td:nth-of-type(2)`;
    const thirdCourse = `${courses}:nth-of-type(3)`;
    const thirdCourseYear = `${thirdCourse} td:nth-of-type(1)`;
    const thirdCourseTitle = `${thirdCourse} td:nth-of-type(2)`;

    assert.dom(header).hasText('My Courses');
    assert.dom(allLinks).exists({ count: 6 });
    assert.dom(courses).exists({ count: 3 });

    assert.dom(firstCourseYear).hasText(mockCourses[0].academicYear);
    assert.ok(find(firstCourseTitle).textContent.includes(mockCourses[0].title));
    assert.ok(find(firstCourseTitle).textContent.includes(mockCourses[0].externalId));

    assert.dom(secondCourseYear).hasText(mockCourses[1].academicYear);
    assert.dom(secondCourseTitle).hasText(mockCourses[1].title);

    assert.dom(thirdCourseYear).hasText(mockCourses[2].academicYear);
    assert.dom(thirdCourseTitle).hasText(mockCourses[2].title);
  });


  test('list courses for un-privileged users', async function(assert) {
    assert.expect(10);
    this.owner.register('service:currentUser', currentUserMockUnprivileged);
    await render(hbs`{{dashboard-mycourses}}`);

    const header = '.dashboard-block-header';
    const allLinks = `table a`;
    const courses = `table tr`;
    const firstCourse = `${courses}:nth-of-type(1)`;
    const firstCourseYear = `${firstCourse} td:nth-of-type(1)`;
    const firstCourseTitle = `${firstCourse} td:nth-of-type(2)`;
    const secondCourse = `${courses}:nth-of-type(2)`;
    const secondCourseYear = `${secondCourse} td:nth-of-type(1)`;
    const secondCourseTitle = `${secondCourse} td:nth-of-type(2)`;
    const thirdCourse = `${courses}:nth-of-type(3)`;
    const thirdCourseYear = `${thirdCourse} td:nth-of-type(1)`;
    const thirdCourseTitle = `${thirdCourse} td:nth-of-type(2)`;

    assert.dom(header).hasText('My Courses');
    assert.dom(allLinks).doesNotExist();
    assert.dom(courses).exists({ count: 3 });

    assert.dom(firstCourseYear).hasText(mockCourses[0].academicYear);
    assert.ok(find(firstCourseTitle).textContent.includes(mockCourses[0].title));
    assert.notOk(find(firstCourseTitle).textContent.includes(mockCourses[0].externalId));

    assert.dom(secondCourseYear).hasText(mockCourses[1].academicYear);
    assert.dom(secondCourseTitle).hasText(mockCourses[1].title);

    assert.dom(thirdCourseYear).hasText(mockCourses[2].academicYear);
    assert.dom(thirdCourseTitle).hasText(mockCourses[2].title);
  });

  test('display none when no courses', async function(assert) {
    assert.expect(2);
    this.owner.register('service:currentUser', currentUserMockNoCourses);
    await render(hbs`{{dashboard-mycourses}}`);
    assert.dom('.dashboard-block-header').hasText('My Courses');

    assert.dom('.dashboard-block-body').hasText('None');

  });
});
