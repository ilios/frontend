import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { component } from 'ilios/tests/pages/components/instructor-groups/root';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

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
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
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
    await render(hbs`<InstructorGroups::Root @schools={{this.schools}} />`);
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
    assert.expect(10);
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('setSchoolId', (schoolId) => {
      assert.strictEqual(schoolId, '3');
      this.set('schoolId', schoolId);
    });

    await render(hbs`<InstructorGroups::Root
      @schools={{this.schools}}
      @setSchoolId={{this.setSchoolId}}
      @schoolId={{this.schoolId}}
    />`);
    assert.strictEqual(component.schoolFilter.selectedSchool, '2');
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'instructor group 3');
    assert.strictEqual(component.list.items[1].title, 'instructor group 4');
    assert.strictEqual(component.list.items[2].title, 'instructor group 5');

    await component.schoolFilter.select(3);
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'instructor group 6');
    assert.strictEqual(component.list.items[1].title, 'instructor group 7');
    assert.strictEqual(component.list.items[2].title, 'instructor group 8');
  });

  test('title filter works', async function (assert) {
    assert.expect(7);
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('setTitleFilter', (titleFilter) => {
      assert.ok(titleFilter, '4');
      this.set('titleFilter', titleFilter);
    });

    await render(hbs`<InstructorGroups::Root
      @schools={{this.schools}}
      @setTitleFilter={{this.setTitleFilter}}
      @titleFilter={{this.titleFilter}}
    />`);
    assert.strictEqual(component.list.items.length, 3);
    assert.strictEqual(component.list.items[0].title, 'instructor group 3');
    assert.strictEqual(component.list.items[1].title, 'instructor group 4');
    assert.strictEqual(component.list.items[2].title, 'instructor group 5');

    await component.setTitleFilter('4');
    assert.strictEqual(component.list.items.length, 1);
    assert.strictEqual(component.list.items[0].title, 'instructor group 4');
  });
});
