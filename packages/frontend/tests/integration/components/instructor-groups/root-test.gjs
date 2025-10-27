import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import Service from '@ember/service';
import { component } from 'frontend/tests/pages/components/instructor-groups/root';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import Root from 'frontend/components/instructor-groups/root';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | instructor-groups/root', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    for (let i = 0; i < 4; i++) {
      const school = this.server.create('school');
      this.server.createList('instructor-group', 3, { school });
    }
    this.schools = await this.owner.lookup('service:store').findAll('school');

    const user = this.server.create('user', { schoolId: 2 });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);
  });

  const setupPermissionChecker = function (scope, can) {
    const permissionCheckerMock = class extends Service {
      async canDeleteInstructorGroup() {
        return can;
      }
      async canCreateInstructorGroup() {
        return can;
      }
    };
    scope.owner.register('service:permissionChecker', permissionCheckerMock);
  };

  test('it renders', async function (assert) {
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    await render(
      <template><Root @schools={{this.schools}} @sortBy="title" @setSortBy={{(noop)}} /></template>,
    );
    assert.strictEqual(component.headerTitle, 'Instructor Groups (3)');
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'instructor group 3');
    assert.strictEqual(component.list.items[1].title, 'instructor group 4');
    assert.strictEqual(component.list.items[2].title, 'instructor group 5');
    assert.strictEqual(component.schoolFilter.schools.length, 4);
    assert.strictEqual(component.schoolFilter.schools[0].text, 'school 0');
    assert.strictEqual(component.schoolFilter.schools[1].text, 'school 1');
    assert.strictEqual(component.schoolFilter.selectedSchool, '2');
    await a11yAudit(this.element);
  });

  test('school filter works', async function (assert) {
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('setSchoolId', (schoolId) => {
      assert.step('setSchoolId called');
      assert.strictEqual(schoolId, '3');
      this.set('schoolId', schoolId);
    });

    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @setSchoolId={{this.setSchoolId}}
          @schoolId={{this.schoolId}}
          @sortBy="title"
          @setSortBy={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.headerTitle, 'Instructor Groups (3)');
    assert.strictEqual(component.schoolFilter.selectedSchool, '2');
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'instructor group 3');
    assert.strictEqual(component.list.items[1].title, 'instructor group 4');
    assert.strictEqual(component.list.items[2].title, 'instructor group 5');

    await component.schoolFilter.select(3);
    assert.strictEqual(component.headerTitle, 'Instructor Groups (3)');
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'instructor group 6');
    assert.strictEqual(component.list.items[1].title, 'instructor group 7');
    assert.strictEqual(component.list.items[2].title, 'instructor group 8');
    assert.verifySteps(['setSchoolId called']);
  });

  test('title filter works', async function (assert) {
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('setTitleFilter', (titleFilter) => {
      assert.step('setTitleFilter called');
      assert.ok(titleFilter, '4');
      this.set('titleFilter', titleFilter);
    });

    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @setTitleFilter={{this.setTitleFilter}}
          @titleFilter={{this.titleFilter}}
          @sortBy="title"
          @setSortBy={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.headerTitle, 'Instructor Groups (3)');
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'instructor group 3');
    assert.strictEqual(component.list.items[1].title, 'instructor group 4');
    assert.strictEqual(component.list.items[2].title, 'instructor group 5');

    await component.setTitleFilter('4');
    assert.strictEqual(component.headerTitle, 'Instructor Groups (1)');
    assert.strictEqual(component.list.items.length, 1);
    assert.strictEqual(component.list.items[0].title, 'instructor group 4');
    assert.verifySteps(['setTitleFilter called']);
  });

  test('sort', async function (assert) {
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('sortBy', 'title');
    this.set('setSortBy', (sortBy) => {
      assert.step('setSortBy called');
      this.set(sortBy, 'title:desc');
      this.set('sortBy', sortBy);
    });

    await render(
      <template>
        <Root @schools={{this.schools}} @sortBy={{this.sortBy}} @setSortBy={{this.setSortBy}} />
      </template>,
    );

    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'instructor group 3');
    assert.strictEqual(component.list.items[1].title, 'instructor group 4');
    assert.strictEqual(component.list.items[2].title, 'instructor group 5');

    await component.list.header.title.click();
    assert.strictEqual(component.list.items[0].title, 'instructor group 5');
    assert.strictEqual(component.list.items[1].title, 'instructor group 4');
    assert.strictEqual(component.list.items[2].title, 'instructor group 3');
    assert.verifySteps(['setSortBy called']);
  });
});
