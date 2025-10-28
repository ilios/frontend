import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import Service from '@ember/service';
import { defer } from 'rsvp';
import Loader from 'ilios-common/components/course/loader';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | course/loader', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      school,
    });
    let { promise, resolve } = defer();
    class DataLoader extends Service {
      loadCourse(id) {
        assert.step('loadCourse called');
        assert.strictEqual(id, course.id);
        return promise;
      }
    }
    this.owner.register('service:dataLoader', DataLoader);
    class PermissionCheckerStub extends Service {
      canCreateCourse() {
        return false;
      }
    }

    this.owner.register('service:permissionChecker', PermissionCheckerStub);

    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    const renderPromise = render(
      <template><Loader @course={{this.course}} @setShowDetails={{(noop)}} /></template>,
    );
    await waitFor('section');
    assert.dom('section').hasClass('course-loader');
    assert.dom('section').hasAttribute('aria-hidden', 'true');
    resolve();
    await renderPromise;
    assert.verifySteps(['loadCourse called']);
  });
});
