import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Integration | Component | dashboard mycourses', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('list courses for privileged users', async function(assert) {
    assert.expect(10);
    const user = this.server.create('user');
    const jwtObject = {
      'user_id': user.id,
      'performs_non_learner_function': true,
    };
    const encodedData = window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
    await authenticateSession({
      jwt: encodedData
    });

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user]
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });
    await render(hbs`<DashboardMycourses />`);

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

    assert.dom(firstCourseYear).hasText('2013 - 2014');
    assert.dom(firstCourseTitle).hasText('course 0 (ABC123)');

    assert.dom(secondCourseYear).hasText('2013 - 2014');
    assert.dom(secondCourseTitle).hasText('course 1');

    assert.dom(thirdCourseYear).hasText('2013 - 2014');
    assert.dom(thirdCourseTitle).hasText('course 2');
  });

  test('list courses for un-privileged users', async function(assert) {
    assert.expect(10);
    const user = this.server.create('user');
    const jwtObject = {
      'user_id': user.id,
      'performs_non_learner_function': false,
    };
    const encodedData = window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
    await authenticateSession({
      jwt: encodedData
    });

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user]
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

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

    assert.dom(firstCourseYear).hasText('2013 - 2014');
    assert.dom(firstCourseTitle).hasText('course 0');

    assert.dom(secondCourseYear).hasText('2013 - 2014');
    assert.dom(secondCourseTitle).hasText('course 1');

    assert.dom(thirdCourseYear).hasText('2013 - 2014');
    assert.dom(thirdCourseTitle).hasText('course 2');
  });

  test('display none when no courses', async function(assert) {
    assert.expect(2);
    await authenticateSession();
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);
    assert.dom('.dashboard-block-header').hasText('My Courses');

    assert.dom('.dashboard-block-body').hasText('None');

  });
});
