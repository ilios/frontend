import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/new-learningmaterial';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import NewLearningmaterial from 'ilios-common/components/new-learningmaterial';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

// @todo flesh this integration test out [ST 2020/09/02]
module('Integration | Component | new learningmaterial', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({
      school,
      displayName: 'Clem Chowder',
    });
  });

  test('owning user has additional info', async function (assert) {
    this.set('type', 'citation');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.owningUser.userNameInfo.fullName, 'Clem Chowder');
    assert.ok(component.owningUser.userNameInfo.hasAdditionalInfo);
    assert.notOk(component.owningUser.userNameInfo.isTooltipVisible);
    await component.owningUser.userNameInfo.expandTooltip();
    assert.ok(component.owningUser.userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.owningUser.userNameInfo.tooltipContents,
      'Campus name of record: 0 guy M, Mc0son',
    );
    await component.owningUser.userNameInfo.closeTooltip();
    assert.notOk(component.owningUser.userNameInfo.isTooltipVisible);
  });

  test('link validation', async function (assert) {
    this.set('type', 'link');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.url.hasError);
    await component.save();
    assert.strictEqual(component.url.error, 'URL must be a valid url');
    await component.url.set('https://validurl.edu/');
    assert.notOk(component.url.hasError);
    await component.url.set('https://validurl.edu/but-way-too-long/' + '0123456789'.repeat(25));
    assert.strictEqual(component.url.error, 'URL is too long (maximum is 256 characters)');
  });

  test('missing file', async function (assert) {
    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.fileUpload.hasError);
    await component.save();
    assert.strictEqual(component.fileUpload.error, 'Missing file');
  });

  test('validate copyright permission', async function (assert) {
    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.copyrightPermission.hasError);
    assert.notOk(component.copyrightRationale.hasError);
    await component.save();
    assert.strictEqual(
      component.copyrightPermission.error,
      'Agreement or alternate rationale is required for upload',
    );
    assert.strictEqual(component.copyrightRationale.error, 'Copyright Rationale can not be blank');
    await component.copyrightPermission.toggle();
    assert.notOk(component.copyrightPermission.hasError);
    assert.notOk(component.copyrightRationale.isVisible);
  });

  test('validate copyright rationale', async function (assert) {
    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.copyrightPermission.hasError);
    assert.notOk(component.copyrightRationale.hasError);
    await component.save();
    assert.strictEqual(
      component.copyrightPermission.error,
      'Agreement or alternate rationale is required for upload',
    );
    assert.strictEqual(component.copyrightRationale.error, 'Copyright Rationale can not be blank');
    await component.copyrightRationale.set('my rationale');
    assert.notOk(component.copyrightRationale.hasError);
    assert.notOk(component.copyrightPermission.hasError);
  });

  test('validate original author', async function (assert) {
    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.author.hasError);
    await component.save();
    assert.strictEqual(component.author.error, 'Content Author can not be blank');
    await component.author.set('author');
    assert.notOk(component.hasError);
    await component.author.set('a');
    assert.ok(component.author.error, '');
    await component.author.set('longer author');
    assert.notOk(component.author.hasError);
    await component.author.set('super long author'.repeat(20));
    assert.strictEqual(
      component.author.error,
      'Content Author is too long (maximum is 80 characters)',
    );
  });

  test('validate display name', async function (assert) {
    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.displayName.hasError);
    await component.save();
    assert.strictEqual(component.displayName.error, 'Display Name can not be blank');
    await component.displayName.set('t');
    assert.strictEqual(
      component.displayName.error,
      'Display Name is too short (minimum is 4 characters)',
    );
    await component.displayName.set('super long title'.repeat(20));
    assert.strictEqual(
      component.displayName.error,
      'Display Name is too long (maximum is 120 characters)',
    );
    await component.displayName.set('display name');
    assert.notOk(component.displayName.hasError);
  });
});
