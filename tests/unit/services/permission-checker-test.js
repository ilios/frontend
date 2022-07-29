import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | permission-checker', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:permission-checker');
    assert.ok(service);
  });

  test('checks permissions', async function (assert) {
    assert.expect(7);
    const school = { id: 1 };

    const apiVersionMock = Service.extend({
      async getIsMismatched() {
        return false;
      },
    });
    this.owner.register('service:apiVersion', apiVersionMock);

    const currentUserMock = Service.extend({
      isRoot: false,
      async getRolesInSchool(sch) {
        assert.strictEqual(sch, school);
        return ['ADMIN'];
      },
    });
    this.owner.register('service:currentUser', currentUserMock);

    const permissionMatrixMock = Service.extend({
      getPermittedRoles(sch, cap) {
        assert.strictEqual(sch, school);
        assert.strictEqual(cap, 'GO_FORTH');

        return ['ADMIN'];
      },
      hasPermission(sch, cap, roles) {
        assert.strictEqual(sch, school);
        assert.strictEqual(cap, 'GO_FORTH');
        assert.deepEqual(roles, ['ADMIN']);

        return ['ADMIN'];
      },
    });
    this.owner.register('service:permissionMatrix', permissionMatrixMock);

    const service = this.owner.lookup('service:permission-checker');
    const canChangeInSchool = await service.canChangeInSchool(school, 'GO_FORTH');
    assert.ok(canChangeInSchool);
  });

  test('api version mismatch stops the show', async function (assert) {
    assert.expect(2);
    const school = { id: 1 };

    const apiVersionMock = Service.extend({
      async getIsMismatched() {
        assert.ok(true);
        return true;
      },
    });
    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    this.owner.register('service:apiVersion', apiVersionMock);
    const service = this.owner.lookup('service:permission-checker');
    const canChangeInSchool = await service.canChangeInSchool(school, 'GO_FORTH');
    assert.notOk(canChangeInSchool);
  });

  test('root can do anything', async function (assert) {
    assert.expect(2);
    const school = { id: 1 };

    const apiVersionMock = Service.extend({
      async getIsMismatched() {
        return false;
      },
    });
    this.owner.register('service:apiVersion', apiVersionMock);

    const currentUserMock = Service.extend({
      get isRoot() {
        assert.ok(true);
        return true;
      },
    });
    this.owner.register('service:currentUser', currentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canChangeInSchool = await service.canChangeInSchool(school, 'GO_FORTH');
    assert.ok(canChangeInSchool);
  });

  test('can update learner group', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learnerGroup', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    const currentUserMock = Service.extend({
      isRoot: false,
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return ['SCHOOL_ADMINISTRATOR'];
      },
    });
    this.owner.register('service:currentUser', currentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canUpdateLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.ok(canUpdateLearnerGroup);
  });

  test('can delete learner group', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learnerGroup', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    const currentUserMock = Service.extend({
      isRoot: false,
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return ['SCHOOL_ADMINISTRATOR'];
      },
    });
    this.owner.register('service:currentUser', currentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.ok(canDeleteLearnerGroup);
  });

  test('can not update learner group', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learnerGroup', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    const currentUserMock = Service.extend({
      isRoot: false,
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return [];
      },
    });
    this.owner.register('service:currentUser', currentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canUpdateLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.notOk(canUpdateLearnerGroup);
  });

  test('can not delete learner group', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learnerGroup', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    const currentUserMock = Service.extend({
      isRoot: false,
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return [];
      },
    });
    this.owner.register('service:currentUser', currentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.notOk(canDeleteLearnerGroup);
  });
});
