import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { component } from 'frontend/tests/pages/components/courses/list';
import List from 'frontend/components/courses/list';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | courses/list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const course1 = this.server.create('course', {
      title: 'Alpha',
      level: 2,
      startDate: '2023-04-23',
      endDate: '2023-05-30',
      published: false,
      publishedAsTbd: false,
      locked: true,
    });
    const course2 = this.server.create('course', {
      title: 'Omega',
      level: 1,
      startDate: '2022-01-11',
      endDate: '2022-01-12',
      published: true,
      publishedAsTbd: false,
      locked: false,
    });
    this.course1 = await this.owner.lookup('service:store').findRecord('course', course1.id);
    this.course2 = await this.owner.lookup('service:store').findRecord('course', course2.id);
    this.permissionCheckerMock = class extends Service {
      async canUpdateCourse() {
        return true;
      }
      async canUnlockCourse() {
        return true;
      }
      async canDeleteCourse() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
  });

  test('it renders', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', '');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.ok(component.listIsPresent);
  });

  test('it renders empty - no courses', async function (assert) {
    this.set('sortBy', '');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{(array)}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 0);
    assert.notOk(component.listIsPresent);
  });

  test('it renders empty - no course match filter', async function (assert) {
    this.set('sortBy', '');
    this.set('query', 'whatever');
    await render(
      <template>
        <List
          @courses={{(array)}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 0);
    assert.notOk(component.listIsPresent);
  });

  test('sort by title', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'title');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].title, 'Alpha');
    assert.strictEqual(component.courses[1].title, 'Omega');
    assert.ok(component.isSortedByTitleAscending);
  });

  test('sort by title descending', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'title:desc');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].title, 'Omega');
    assert.strictEqual(component.courses[1].title, 'Alpha');
    assert.ok(component.isSortedByTitleDescending);
  });

  test('change sort order - title', async function (assert) {
    assert.expect(1);
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'title');
    this.set('query', '');
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'title:desc');
    });
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{this.setSortBy}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    await component.sortByTitle();
  });

  test('sort by level', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'level');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].level, '1');
    assert.strictEqual(component.courses[1].level, '2');
    assert.ok(component.isSortedByLevelAscending);
  });

  test('sort by level descending', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'level:desc');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].level, '2');
    assert.strictEqual(component.courses[1].level, '1');
    assert.ok(component.isSortedByLevelDescending);
  });

  test('change sort order - level', async function (assert) {
    assert.expect(1);
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'level');
    this.set('query', '');
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'level:desc');
    });
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{this.setSortBy}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    await component.sortByLevel();
  });

  test('sort by start date', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'startDate');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].startDate, '01/11/2022');
    assert.strictEqual(component.courses[1].startDate, '04/23/2023');
    assert.ok(component.isSortedByStartDateAscending);
  });

  test('sort by start date descending', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'startDate:desc');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].startDate, '04/23/2023');
    assert.strictEqual(component.courses[1].startDate, '01/11/2022');
    assert.ok(component.isSortedByStartDateDescending);
  });

  test('change sort order - start date', async function (assert) {
    assert.expect(1);
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'startDate');
    this.set('query', '');
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'startDate:desc');
    });
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{this.setSortBy}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    await component.sortByStartDate();
  });

  test('sort by end date', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'endDate');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].endDate, '01/12/2022');
    assert.strictEqual(component.courses[1].endDate, '05/30/2023');
    assert.ok(component.isSortedByEndDateAscending);
  });

  test('sort by end date descending', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'endDate:desc');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].endDate, '05/30/2023');
    assert.strictEqual(component.courses[1].endDate, '01/12/2022');
    assert.ok(component.isSortedByEndDateDescending);
  });

  test('change sort order - end date', async function (assert) {
    assert.expect(1);
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'endDate');
    this.set('query', '');
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'endDate:desc');
    });
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{this.setSortBy}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    await component.sortByEndDate();
  });

  test('sort by status', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'status');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].status, 'Not Published');
    assert.strictEqual(component.courses[1].status, 'Published');
    assert.ok(component.isSortedByStatusAscending);
  });

  test('sort by status descending', async function (assert) {
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'status:desc');
    this.set('query', '');
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].status, 'Published');
    assert.strictEqual(component.courses[1].status, 'Not Published');
    assert.ok(component.isSortedByStatusDescending);
  });

  test('change sort order - status', async function (assert) {
    assert.expect(1);
    this.set('courses', [this.course1, this.course2]);
    this.set('sortBy', 'status');
    this.set('query', '');
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'status:desc');
    });
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{this.setSortBy}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    await component.sortByStatus();
  });

  test('lock', async function (assert) {
    assert.expect(2);
    this.set('courses', [this.course2]);
    this.set('sortBy', 'status');
    this.set('query', '');
    this.set('lock', (course) => {
      assert.strictEqual(course, this.course2);
    });
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{this.lock}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.courses[0].isUnlocked);
    await component.courses[0].lock();
  });

  test('unlock', async function (assert) {
    assert.expect(2);
    this.set('courses', [this.course1]);
    this.set('sortBy', 'status');
    this.set('query', '');
    this.set('unlock', (course) => {
      assert.strictEqual(course, this.course1);
    });
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{(noop)}}
          @setSortBy={{(noop)}}
          @unlock={{this.unlock}}
        />
      </template>,
    );
    assert.ok(component.courses[0].isLocked);
    await component.courses[0].unLock();
  });

  test('remove', async function (assert) {
    assert.expect(1);
    this.set('courses', [this.course1]);
    this.set('sortBy', 'status');
    this.set('query', '');
    this.set('remove', (course) => {
      assert.strictEqual(course, this.course1);
    });
    await render(
      <template>
        <List
          @courses={{this.courses}}
          @query={{this.query}}
          @sortBy={{this.sortBy}}
          @lock={{(noop)}}
          @remove={{this.remove}}
          @setSortBy={{(noop)}}
          @unlock={{(noop)}}
        />
      </template>,
    );
    await component.courses[0].remove();
    await component.confirmCourseRemoval();
  });
});
