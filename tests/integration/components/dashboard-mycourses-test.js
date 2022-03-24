import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'ilios/tests/pages/components/dashboard-mycourses';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | dashboard mycourses', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('list courses for privileged users', async function (assert) {
    assert.expect(9);
    const user = await setupAuthentication({}, true);

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user],
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.strictEqual(component.title, 'My Courses');
    assert.strictEqual(component.courses.length, 3);
    assert.strictEqual(component.courses[0].text, '2013 course 0 (ABC123)');
    assert.strictEqual(component.courses[1].text, '2013 course 1');
    assert.strictEqual(component.courses[2].text, '2013 course 2');
    assert.ok(component.courses[0].isLinked);
    assert.ok(component.courses[1].isLinked);
    assert.ok(component.courses[2].isLinked);
    a11yAudit(this.element);
  });

  test('list courses for un-privileged users', async function (assert) {
    assert.expect(8);
    const user = await setupAuthentication();

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user],
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.strictEqual(component.courses.length, 3);
    assert.strictEqual(component.courses[0].text, '2013 course 0');
    assert.strictEqual(component.courses[1].text, '2013 course 1');
    assert.strictEqual(component.courses[2].text, '2013 course 2');
    assert.notOk(component.courses[0].isLinked);
    assert.notOk(component.courses[1].isLinked);
    assert.notOk(component.courses[2].isLinked);
    a11yAudit(this.element);
  });

  test('display none when no courses', async function (assert) {
    assert.expect(3);
    await setupAuthentication();
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.strictEqual(component.courses.length, 1);
    assert.strictEqual(component.courses[0].text, 'None');
    a11yAudit(this.element);
  });

  test('show academic-year range for privileged users', async function (assert) {
    assert.expect(4);
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const user = await setupAuthentication({}, true);

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user],
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.strictEqual(component.courses[0].text, '2013 - 2014 course 0 (ABC123)');
    assert.strictEqual(component.courses[1].text, '2013 - 2014 course 1');
    assert.strictEqual(component.courses[2].text, '2013 - 2014 course 2');
  });

  test('show academic-year range for un-privileged users', async function (assert) {
    assert.expect(4);
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const user = await setupAuthentication({});

    this.server.create('course', {
      directors: [user],
      externalId: 'ABC123',
    });
    this.server.createList('course', 2, {
      directors: [user],
    });
    this.server.get('/api/courses', (schema, { queryParams }) => {
      assert.ok('my' in queryParams);
      return schema.courses.all();
    });

    await render(hbs`<DashboardMycourses />`);

    assert.strictEqual(component.courses[0].text, '2013 - 2014 course 0');
    assert.strictEqual(component.courses[1].text, '2013 - 2014 course 1');
    assert.strictEqual(component.courses[2].text, '2013 - 2014 course 2');
  });
});
