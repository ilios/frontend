import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/instructor-groups/list';
import Service from '@ember/service';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | instructor-groups/list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const PermissionCheckerMock = class extends Service {
      async canDeleteInstructorGroup() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
  });

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('instructor-group', 3, { school });
    const instructorGroupModels = await this.owner
      .lookup('service:store')
      .findAll('instructor-group');
    this.set('instructorGroups', instructorGroupModels);
    await render(hbs`<InstructorGroups::List
      @instructorGroups={{this.instructorGroups}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    assert.strictEqual(component.header.title.text, 'Instructor Group Title');
    assert.strictEqual(component.header.members.text, 'Members');
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
    assert.strictEqual(component.items[0].users, '0');
    assert.strictEqual(component.items[1].title, 'instructor group 1');
    assert.strictEqual(component.items[1].users, '0');
    assert.strictEqual(component.items[2].title, 'instructor group 2');
    assert.strictEqual(component.items[2].users, '0');
    await a11yAudit(this.element);
  });

  test('it renders empty', async function (assert) {
    await render(hbs`<InstructorGroups::List
      @instructorGroups={{(array)}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);

    assert.strictEqual(component.items.length, 0);
    assert.ok(component.isEmpty);
  });

  test('remove', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('instructor-group', 3, { school });
    const instructorGroupModels = await this.owner
      .lookup('service:store')
      .findAll('instructor-group');
    this.set('instructorGroups', instructorGroupModels);
    await render(hbs`<InstructorGroups::List
      @instructorGroups={{this.instructorGroups}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    assert.strictEqual(this.server.db.instructorGroups.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
    await component.items[0].remove();
    await component.confirmRemoval.confirm();
    assert.strictEqual(this.server.db.instructorGroups.length, 2);
    assert.strictEqual(component.items.length, 2);
    assert.strictEqual(component.items[0].title, 'instructor group 1');
  });

  test('cancel remove', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('instructor-group', 3, { school });
    const instructorGroupModels = await this.owner
      .lookup('service:store')
      .findAll('instructor-group');
    this.set('instructorGroups', instructorGroupModels);
    await render(hbs`<InstructorGroups::List
      @instructorGroups={{this.instructorGroups}}
      @sortBy="title"
      @setSortBy={{(noop)}}
    />`);
    assert.strictEqual(this.server.db.instructorGroups.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
    await component.items[0].remove();
    await component.confirmRemoval.cancel();
    assert.strictEqual(this.server.db.instructorGroups.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
  });

  test('sort', async function (assert) {
    const school = this.server.create('school');
    const users = this.server.createList('user', 5);
    let sessions = this.server
      .createList('course', 5, { school })
      .map((course) => this.server.create('session', { course }));

    this.server.create('instructor-group', {
      school,
      users: [users[0], users[1]],
      offerings: [
        this.server.create('offering', { session: sessions[0] }),
        this.server.create('offering', { session: sessions[1] }),
      ],
      ilmSessions: [this.server.create('ilmSession', { session: sessions[3] })],
    });
    this.server.create('instructor-group', {
      school,
      offerings: [],
      ilmSessions: [this.server.create('ilmSession', { session: sessions[2] })],
    });
    this.server.create('instructor-group', {
      school,
      users: [users[2], users[3], users[4]],
      offerings: [
        this.server.create('offering', { session: sessions[0] }),
        this.server.create('offering', { session: sessions[4] }),
        this.server.create('offering', { session: sessions[4] }),
      ],
    });

    const instructorGroupModels = await this.owner
      .lookup('service:store')
      .findAll('instructor-group');
    this.set('sortBy', 'title');
    this.set('instructorGroups', instructorGroupModels);
    await render(hbs`<InstructorGroups::List
      @instructorGroups={{this.instructorGroups}}
      @sortBy={{this.sortBy}}
      @setSortBy={{set this.sortBy}}
    />`);
    assert.strictEqual(component.items.length, 3);
    assert.ok(component.header.title.isSortedAscending);
    assert.ok(component.header.members.isNotSorted);
    assert.ok(component.header.associatedCourses.isNotSorted);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
    assert.strictEqual(component.items[0].users, '2');
    assert.strictEqual(component.items[1].title, 'instructor group 1');
    assert.strictEqual(component.items[1].users, '0');
    assert.strictEqual(component.items[2].title, 'instructor group 2');
    assert.strictEqual(component.items[2].users, '3');

    await component.header.title.click();
    assert.ok(component.header.title.isSortedDescending);
    assert.ok(component.header.members.isNotSorted);
    assert.ok(component.header.associatedCourses.isNotSorted);
    assert.strictEqual(component.items[0].title, 'instructor group 2');
    assert.strictEqual(component.items[1].title, 'instructor group 1');
    assert.strictEqual(component.items[2].title, 'instructor group 0');

    await component.header.members.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.members.isSortedAscending);
    assert.ok(component.header.associatedCourses.isNotSorted);
    assert.strictEqual(component.items[0].title, 'instructor group 1');
    assert.strictEqual(component.items[1].title, 'instructor group 0');
    assert.strictEqual(component.items[2].title, 'instructor group 2');

    await component.header.members.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.members.isSortedDescending);
    assert.ok(component.header.associatedCourses.isNotSorted);
    assert.strictEqual(component.items[0].title, 'instructor group 2');
    assert.strictEqual(component.items[1].title, 'instructor group 0');
    assert.strictEqual(component.items[2].title, 'instructor group 1');

    await component.header.associatedCourses.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.members.isNotSorted);
    assert.ok(component.header.associatedCourses.isSortedAscending);
    assert.strictEqual(component.items[0].title, 'instructor group 1');
    assert.strictEqual(component.items[1].title, 'instructor group 2');
    assert.strictEqual(component.items[2].title, 'instructor group 0');

    await component.header.associatedCourses.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.members.isNotSorted);
    assert.ok(component.header.associatedCourses.isSortedDescending);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
    assert.strictEqual(component.items[1].title, 'instructor group 2');
    assert.strictEqual(component.items[2].title, 'instructor group 1');
  });
});
