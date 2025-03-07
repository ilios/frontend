import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'test-app/tests/test-support/mirage';

module('Unit | Service | permission-checker', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:permission-checker');
    assert.ok(service);
  });

  test('checks permissions', async function (assert) {
    assert.expect(7);
    const school = { id: 1 };

    class ApiVersionMock extends Service {
      async getIsMismatched() {
        return false;
      }
    }
    this.owner.register('service:apiVersion', ApiVersionMock);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.strictEqual(sch, school);
        return ['ADMIN'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    class PermissionMatrixMock extends Service {
      getPermittedRoles(sch, cap) {
        assert.strictEqual(sch, school);
        assert.strictEqual(cap, 'GO_FORTH');

        return ['ADMIN'];
      }
      hasPermission(sch, cap, roles) {
        assert.strictEqual(sch, school);
        assert.strictEqual(cap, 'GO_FORTH');
        assert.deepEqual(roles, ['ADMIN']);

        return ['ADMIN'];
      }
    }
    this.owner.register('service:permissionMatrix', PermissionMatrixMock);

    const service = this.owner.lookup('service:permission-checker');
    const canChangeInSchool = await service.canChangeInSchool(school, 'GO_FORTH');
    assert.ok(canChangeInSchool);
  });

  test('api version mismatch stops the show', async function (assert) {
    assert.expect(2);
    const school = { id: 1 };

    class ApiVersionMock extends Service {
      async getIsMismatched() {
        assert.ok(true);
        return true;
      }
    }
    class CurrentUserMock extends Service {
      isRoot = true;
    }
    this.owner.register('service:apiVersion', ApiVersionMock);
    this.owner.register('service:currentUser', CurrentUserMock);
    const service = this.owner.lookup('service:permission-checker');
    const canChangeInSchool = await service.canChangeInSchool(school, 'GO_FORTH');
    assert.notOk(canChangeInSchool);
  });

  test('root can do anything', async function (assert) {
    assert.expect(2);
    const school = { id: 1 };

    class ApiVersionMock extends Service {
      async getIsMismatched() {
        return false;
      }
    }
    this.owner.register('service:apiVersion', ApiVersionMock);

    class CurrentUserMock extends Service {
      get isRoot() {
        assert.ok(true);
        return true;
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canChangeInSchool = await service.canChangeInSchool(school, 'GO_FORTH');
    assert.ok(canChangeInSchool);
  });

  test('can update learner group', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learner-group', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return ['SCHOOL_ADMINISTRATOR'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canUpdateLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.ok(canUpdateLearnerGroup);
  });

  test('can delete learner group', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learner-group', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return ['SCHOOL_ADMINISTRATOR'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.ok(canDeleteLearnerGroup);
  });

  test('can not update learner group', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learner-group', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return [];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canUpdateLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.notOk(canUpdateLearnerGroup);
  });

  test('can not delete learner group', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learner-group', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return [];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.notOk(canDeleteLearnerGroup);
  });

  test('can delete curriculum inventory report as school administrator', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', { program });
    const model = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return ['SCHOOL_ADMINISTRATOR'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteCurriculumInventoryReport =
      await service.canDeleteCurriculumInventoryReport(model);
    assert.ok(canDeleteCurriculumInventoryReport);
  });

  test('can delete own curriculum inventory report', async function (assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', { program });
    const model = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.strictEqual(sch.id, school.id);
        return [];
      }
      async getRolesInCurriculumInventoryReport(rpt) {
        assert.strictEqual(rpt.id, model.id);
        return ['CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteCurriculumInventoryReport =
      await service.canDeleteCurriculumInventoryReport(model);
    assert.ok(canDeleteCurriculumInventoryReport);
  });

  test('can not delete finalized curriculum inventory report', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const ciExport = this.server.create('curriculum-inventory-export');
    const report = this.server.create('curriculum-inventory-report', { program, export: ciExport });
    const model = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteCurriculumInventoryReport =
      await service.canDeleteCurriculumInventoryReport(model);
    assert.notOk(canDeleteCurriculumInventoryReport);
  });
});
