import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';
import Service from '@ember/service';
import EmberObject from '@ember/object';

module('Unit | Controller | curriculum-inventory-reports', function(hooks) {
  setupTest(hooks);

  test('selectedSchool', async function(assert) {
    assert.expect(4);

    const schoolId =  10;
    const currentUsersSchoolMock = EmberObject.create();
    const schoolMock = EmberObject.create();
    const userMock = EmberObject.create({
      school: resolve(currentUsersSchoolMock),
    });
    const currentUserMock = Service.extend({
      model: resolve(userMock),
    });
    const modelMock = EmberObject.create({
      findBy: function(attr, id) {
        assert.equal(attr, 'id');
        assert.equal(id, schoolId);
        return schoolMock;
      },
    });

    this.owner.register('service:currentUser', currentUserMock);
    let controller = this.owner.lookup('controller:curriculum-inventory-reports');

    controller.set('model', modelMock);
    let selectedSchool = await controller.get('selectedSchool');
    assert.equal(selectedSchool, currentUsersSchoolMock);

    controller.set('schoolId', schoolId);
    selectedSchool = await controller.get('selectedSchool');
    assert.equal(selectedSchool, schoolMock);
  });
});
