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
    assert.notOk(component.url.errorMessage.isPresent);
    assert.strictEqual(component.url.ariaInvalid, 'false');

    await component.save();
    assert.strictEqual(component.url.ariaErrorMessage, component.url.errorMessage.id);
    assert.strictEqual(component.url.errorMessage.text, 'URL must be a valid url');
    assert.strictEqual(component.url.ariaInvalid, 'true');

    await component.url.set('https://validurl.edu/');
    assert.notOk(component.url.errorMessage.isPresent);
    assert.strictEqual(component.url.ariaInvalid, 'false');

    await component.url.set('https://validurl.edu/but-way-too-long/' + '0123456789'.repeat(25));
    assert.strictEqual(
      component.url.errorMessage.text,
      'URL is too long (maximum is 256 characters)',
    );
    assert.strictEqual(component.url.ariaInvalid, 'true');
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
    assert.notOk(component.fileUpload.errorMessage.isPresent);
    await component.save();
    assert.strictEqual(component.fileUpload.errorMessage.text, 'Missing file');
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
    assert.notOk(component.copyrightPermission.errorMessage.isPresent);
    assert.strictEqual(component.copyrightPermission.ariaInvalid, 'false');
    assert.notOk(component.copyrightRationale.errorMessage.isPresent);
    assert.strictEqual(component.copyrightRationale.ariaInvalid, 'false');

    await component.save();
    assert.strictEqual(
      component.copyrightPermission.ariaErrorMessage,
      component.copyrightPermission.errorMessage.id,
    );
    assert.strictEqual(
      component.copyrightPermission.errorMessage.text,
      'Agreement or alternate rationale is required for upload',
    );
    assert.strictEqual(component.copyrightPermission.ariaInvalid, 'true');
    assert.strictEqual(
      component.copyrightRationale.errorMessage.text,
      'Copyright Rationale can not be blank',
    );
    assert.strictEqual(component.copyrightRationale.ariaInvalid, 'true');

    await component.copyrightPermission.toggle();
    assert.notOk(component.copyrightPermission.errorMessage.isPresent);
    assert.strictEqual(component.copyrightPermission.ariaInvalid, 'false');
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
    assert.notOk(component.copyrightPermission.errorMessage.isPresent);
    assert.notOk(component.copyrightRationale.errorMessage.isPresent);
    assert.strictEqual(component.copyrightRationale.ariaInvalid, 'false');

    await component.save();
    assert.strictEqual(
      component.copyrightRationale.ariaErrorMessage,
      component.copyrightRationale.errorMessage.id,
    );

    assert.strictEqual(
      component.copyrightPermission.errorMessage.text,
      'Agreement or alternate rationale is required for upload',
    );
    assert.strictEqual(
      component.copyrightRationale.errorMessage.text,
      'Copyright Rationale can not be blank',
    );
    assert.strictEqual(component.copyrightRationale.ariaInvalid, 'true');

    await component.copyrightRationale.set('my rationale');
    assert.notOk(component.copyrightPermission.errorMessage.isPresent);
    assert.notOk(component.copyrightRationale.errorMessage.isPresent);
    assert.strictEqual(component.copyrightRationale.ariaInvalid, 'false');
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
    assert.notOk(component.author.errorMessage.isPresent);
    assert.strictEqual(component.author.ariaInvalid, 'false');

    await component.save();
    assert.strictEqual(component.author.ariaErrorMessage, component.author.errorMessage.id);
    assert.strictEqual(component.author.errorMessage.text, 'Content Author can not be blank');

    await component.author.set('author');
    assert.notOk(component.author.errorMessage.isPresent);
    assert.strictEqual(component.author.ariaInvalid, 'false');

    await component.author.set('a');
    assert.ok(component.author.errorMessage.isPresent);
    assert.strictEqual(component.author.ariaInvalid, 'true');

    await component.author.set('longer author');
    assert.notOk(component.author.errorMessage.isPresent);
    assert.strictEqual(component.author.ariaInvalid, 'false');

    await component.author.set('super long author'.repeat(20));
    assert.strictEqual(
      component.author.errorMessage.text,
      'Content Author is too long (maximum is 80 characters)',
    );
    assert.strictEqual(component.author.ariaInvalid, 'true');
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
    assert.notOk(component.displayName.errorMessage.isPresent);
    assert.strictEqual(component.displayName.ariaInvalid, 'false');

    await component.save();
    assert.strictEqual(
      component.displayName.ariaErrorMessage,
      component.displayName.errorMessage.id,
    );
    assert.strictEqual(component.displayName.errorMessage.text, 'Display Name can not be blank');
    assert.strictEqual(component.displayName.ariaInvalid, 'true');

    await component.displayName.set('t');
    assert.strictEqual(
      component.displayName.errorMessage.text,
      'Display Name is too short (minimum is 4 characters)',
    );
    assert.strictEqual(component.displayName.ariaInvalid, 'true');

    await component.displayName.set('super long title'.repeat(20));
    assert.strictEqual(
      component.displayName.errorMessage.text,
      'Display Name is too long (maximum is 120 characters)',
    );
    assert.strictEqual(component.displayName.ariaInvalid, 'true');

    await component.displayName.set('display name');
    assert.notOk(component.displayName.errorMessage.isPresent);
    assert.strictEqual(component.displayName.ariaInvalid, 'false');
  });
});
