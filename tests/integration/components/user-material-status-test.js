import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { component } from 'ilios-common/page-objects/components/user-material-status';

module('Integration | Component | user-material-status', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const user = this.server.create('user');
    for (let i = 1; i < 4; i++) {
      this.server.create('user-session-material-status', {
        id: i,
        status: i - 1,
        material: this.server.create('session-learning-material', { id: i }),
        user,
      });
    }
    this.server.create('session-learning-material', { id: 4 });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:current-user', CurrentUserMock);

    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          materialStatusEnabled: true,
          apiVersion,
        },
      };
    });
  });

  test('it renders with no status', async function (assert) {
    this.set('learningMaterial', {
      sessionLearningMaterial: 4,
    });

    await render(hbs`<UserMaterialStatus @learningMaterial={{this.learningMaterial}} />`);
    assert.false(component.isChecked);
    assert.dom(this.element).hasText('');
  });

  test('it renders status of not started', async function (assert) {
    this.set('learningMaterial', {
      sessionLearningMaterial: 1,
    });

    await render(hbs`<UserMaterialStatus @learningMaterial={{this.learningMaterial}} />`);
    assert.false(component.isChecked);
    assert.dom(this.element).hasText('');
  });

  test('it renders status of in progress', async function (assert) {
    this.set('learningMaterial', {
      sessionLearningMaterial: 2,
    });

    await render(hbs`<UserMaterialStatus @learningMaterial={{this.learningMaterial}} />`);
    assert.true(component.isIndeterminate);
    assert.dom(this.element).hasText('');
  });

  test('it renders status of complete', async function (assert) {
    this.set('learningMaterial', {
      sessionLearningMaterial: 3,
    });

    await render(hbs`<UserMaterialStatus @learningMaterial={{this.learningMaterial}} />`);
    assert.true(component.isChecked);
    assert.dom(this.element).hasText('');
  });

  test('it does not render when not enabled', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          materialStatusEnabled: false,
          apiVersion,
        },
      };
    });
    this.set('learningMaterial', {
      sessionLearningMaterial: 3,
    });

    await render(hbs`<UserMaterialStatus @learningMaterial={{this.learningMaterial}} />`);
    assert.false(component.isPresent);
  });
});
