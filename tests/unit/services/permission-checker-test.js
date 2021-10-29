import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | permission-checker', function (hooks) {
  setupTest(hooks);

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
});
