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
        assert.step('getRolesInSchool called');
        assert.strictEqual(sch, school);
        return ['ADMIN'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    class PermissionMatrixMock extends Service {
      getPermittedRoles(sch, cap) {
        assert.step('getPermittedRoles called');
        assert.strictEqual(sch, school);
        assert.strictEqual(cap, 'GO_FORTH');

        return ['ADMIN'];
      }
      hasPermission(sch, cap, roles) {
        assert.step('hasPermission called');
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
    assert.verifySteps([
      'getPermittedRoles called',
      'getRolesInSchool called',
      'hasPermission called',
    ]);
  });

  test('api version mismatch stops the show', async function (assert) {
    const school = { id: 1 };

    class ApiVersionMock extends Service {
      async getIsMismatched() {
        assert.step('getIsMismatch called');
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
    assert.verifySteps(['getIsMismatch called']);
  });

  test('root can do anything', async function (assert) {
    const school = { id: 1 };

    class ApiVersionMock extends Service {
      async getIsMismatched() {
        return false;
      }
    }
    this.owner.register('service:apiVersion', ApiVersionMock);

    class CurrentUserMock extends Service {
      get isRoot() {
        assert.step('isRoot called');
        return true;
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canChangeInSchool = await service.canChangeInSchool(school, 'GO_FORTH');
    assert.ok(canChangeInSchool);
    assert.verifySteps(['isRoot called']);
  });

  test('can update learner group', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learner-group', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.step('getRolesInSchool called');
        assert.strictEqual(sch.id, school.id);
        return ['SCHOOL_ADMINISTRATOR'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canUpdateLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.ok(canUpdateLearnerGroup);
    assert.verifySteps(['getRolesInSchool called']);
  });

  test('can delete learner group', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learner-group', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.step('getRolesInSchool called');
        assert.strictEqual(sch.id, school.id);
        return ['SCHOOL_ADMINISTRATOR'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.ok(canDeleteLearnerGroup);
    assert.verifySteps(['getRolesInSchool called']);
  });

  test('can not update learner group', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learner-group', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.step('getRolesInSchool called');
        assert.strictEqual(sch.id, school.id);
        return [];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canUpdateLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.notOk(canUpdateLearnerGroup);
    assert.verifySteps(['getRolesInSchool called']);
  });

  test('can not delete learner group', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const group = this.server.create('learner-group', { cohort });
    const model = await this.owner.lookup('service:store').findRecord('learner-group', group.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.step('getRolesInSchool called');
        assert.strictEqual(sch.id, school.id);
        return [];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteLearnerGroup = await service.canUpdateLearnerGroup(model);
    assert.notOk(canDeleteLearnerGroup);
    assert.verifySteps(['getRolesInSchool called']);
  });

  test('can delete curriculum inventory report as school administrator', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', { program });
    const model = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.step('getRolesInSchool called');
        assert.strictEqual(sch.id, school.id);
        return ['SCHOOL_ADMINISTRATOR'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteCurriculumInventoryReport =
      await service.canDeleteCurriculumInventoryReport(model);
    assert.ok(canDeleteCurriculumInventoryReport);
    assert.verifySteps(['getRolesInSchool called']);
  });

  test('can delete own curriculum inventory report', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', { program });
    const model = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);

    class CurrentUserMock extends Service {
      isRoot = false;
      async getRolesInSchool(sch) {
        assert.step('getRolesInSchool called');
        assert.strictEqual(sch.id, school.id);
        return [];
      }
      async getRolesInCurriculumInventoryReport(rpt) {
        assert.step('getRolesInCurriculumInventoryReport called');
        assert.strictEqual(rpt.id, model.id);
        return ['CURRICULUM_INVENTORY_REPORT_ADMINISTRATOR'];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);

    const service = this.owner.lookup('service:permission-checker');
    const canDeleteCurriculumInventoryReport =
      await service.canDeleteCurriculumInventoryReport(model);
    assert.ok(canDeleteCurriculumInventoryReport);
    assert.verifySteps(['getRolesInSchool called', 'getRolesInCurriculumInventoryReport called']);
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
