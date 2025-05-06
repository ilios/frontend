import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import Service from '@ember/service';
import { component } from 'frontend/tests/pages/components/programs/root';
import Root from 'frontend/components/programs/root';

module('Integration | Component | programs/root', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    for (let i = 0; i < 4; i++) {
      const school = this.server.create('school');
      this.server.createList('program', 3, { school });
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
      async canDeleteProgram() {
        return can;
      }
      async canCreateProgram() {
        return can;
      }
    };
    scope.owner.register('service:permissionChecker', permissionCheckerMock);
  };

  test('it renders', async function (assert) {
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    await render(<template><Root @schools={{this.schools}} /></template>);
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'program 3');
    assert.strictEqual(component.list.items[1].title, 'program 4');
    assert.strictEqual(component.list.items[2].title, 'program 5');

    assert.strictEqual(component.schoolFilter.schools.length, 4);
    assert.strictEqual(component.schoolFilter.schools[0].text, 'school 0');
    assert.strictEqual(component.schoolFilter.schools[1].text, 'school 1');
    assert.strictEqual(component.schoolFilter.selectedSchool, '2');
  });

  test('school filter works', async function (assert) {
    assert.expect(10);
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('setSchoolId', (schoolId) => {
      assert.strictEqual(schoolId, '3');
      this.set('schoolId', schoolId);
    });
    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @setSchoolId={{this.setSchoolId}}
          @schoolId={{this.schoolId}}
        />
      </template>,
    );
    assert.strictEqual(component.schoolFilter.selectedSchool, '2');
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'program 3');
    assert.strictEqual(component.list.items[1].title, 'program 4');
    assert.strictEqual(component.list.items[2].title, 'program 5');

    await component.schoolFilter.select(3);
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'program 6');
    assert.strictEqual(component.list.items[1].title, 'program 7');
    assert.strictEqual(component.list.items[2].title, 'program 8');
  });
});
