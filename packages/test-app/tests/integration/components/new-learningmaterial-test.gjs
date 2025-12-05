import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/new-learningmaterial';
import { setupMSW } from 'ilios-common/msw';
import NewLearningmaterial from 'ilios-common/components/new-learningmaterial';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

// @todo flesh this integration test out [ST 2020/09/02]
module('Integration | Component | new learningmaterial', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');
    this.school = await this.server.create('school');
    this.schoolModel = await this.store.findRecord('school', this.school.id);
    this.course = await this.server.create('course', {
      published: true,
      year: 2026,
      school: this.school,
    });
    this.courseModel = await this.store.findRecord('course', this.course.id);
    await setupAuthentication({
      school: this.school,
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
          @isCourse={{true}}
          @subject={{this.courseModel}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.url.errorMessage.isPresent, 'no error message present');
    assert.strictEqual(component.url.ariaInvalid, 'false', 'link aria not invalid');

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
          @isCourse={{true}}
          @subject={{this.courseModel}}
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
          @isCourse={{true}}
          @subject={{this.courseModel}}
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
          @isCourse={{true}}
          @subject={{this.courseModel}}
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

  test('validate accessibility permission enabled', async function (assert) {
    this.schoolConfig = this.store.createRecord('school-config', {
      name: 'learningMaterialAccessibilityRequired',
      value: true,
      school: this.schoolModel,
    });

    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @isCourse={{true}}
          @subject={{this.courseModel}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.markedAccessible.errorMessage.isPresent, 'error message not present');
    assert.strictEqual(component.markedAccessible.ariaInvalid, 'false', 'link aria not invalid');

    await component.save();
    assert.strictEqual(
      component.markedAccessible.ariaErrorMessage,
      component.markedAccessible.errorMessage.id,
      'error message id is correct',
    );
    assert.strictEqual(
      component.markedAccessible.errorMessage.text,
      'Agreement is required for upload',
      'error message text is correct',
    );
    assert.strictEqual(component.markedAccessible.ariaInvalid, 'true', 'link aria is invalid');

    await component.markedAccessible.toggle();
    assert.notOk(
      component.markedAccessible.errorMessage.isPresent,
      'error message no longer present',
    );
    assert.strictEqual(
      component.markedAccessible.ariaInvalid,
      'false',
      'link aria no longer invalid',
    );
  });

  test('validate accessibility permission disabled', async function (assert) {
    this.schoolConfig = this.store.createRecord('school-config', {
      name: 'learningMaterialAccessibilityRequired',
      value: false,
      school: this.schoolModel,
    });

    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @isCourse={{true}}
          @subject={{this.courseModel}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.markedAccessible.errorMessage.isPresent, 'error message not present');
    assert.strictEqual(component.markedAccessible.ariaInvalid, 'false', 'link aria not invalid');

    await component.save();
    assert.notOk(
      component.markedAccessible.errorMessage.isPresent,
      'error message still not present',
    );
    assert.strictEqual(component.markedAccessible.ariaInvalid, 'false', 'link aria still invalid');
  });

  test('validate accessibility requirements link blank', async function (assert) {
    this.schoolConfig = this.store.createRecord('school-config', {
      name: 'learningMaterialAccessibilityRequirementsLink',
      value: '',
      school: this.schoolModel,
    });

    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @isCourse={{true}}
          @subject={{this.courseModel}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.notOk(
      component.accessibilityRequirementsLink.isPresent,
      'accessibility requirements link not visible',
    );
  });

  test('validate accessibility requirements link', async function (assert) {
    this.schoolConfig = this.store.createRecord('school-config', {
      name: 'learningMaterialAccessibilityRequirementsLink',
      value: 'https://iliosproject.org',
      school: this.schoolModel,
    });

    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @isCourse={{true}}
          @subject={{this.courseModel}}
          @learningMaterialStatuses={{(array)}}
          @learningMaterialUserRoles={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.ok(
      component.accessibilityRequirementsLink.isPresent,
      'accessibility requirements link visible',
    );
  });

  test('validate original author', async function (assert) {
    this.set('type', 'file');
    await render(
      <template>
        <NewLearningmaterial
          @type={{this.type}}
          @isCourse={{true}}
          @subject={{this.courseModel}}
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
          @isCourse={{true}}
          @subject={{this.courseModel}}
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
