import Service from '@ember/service';
import { render, waitFor } from '@ember/test-helpers';
import Loader from 'frontend/components/course/loader';
import noop from 'frontend/helpers/noop';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMSW } from 'frontend/tests/msw';
import { module, test } from 'qunit';
import { defer } from 'rsvp';

module('Integration | Component | course/loader', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const school = await this.server.create('school');
    const course = await this.server.create('course', {
      school,
    });
    let { promise, resolve } = defer();
    class DataLoader extends Service {
      loadCourse(id) {
        assert.step('loadCourse called');
        assert.strictEqual(Number(id), course.id);
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
