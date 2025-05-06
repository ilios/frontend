import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/new-learningmaterial';
import { setupMirage } from 'test-app/tests/test-support/mirage';

// @todo flesh this integration test out [ST 2020/09/02]
import NewLearningmaterial from 'ilios-common/components/new-learningmaterial';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';
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
    assert.strictEqual(component.url.validationErrors.length, 0);
    await component.save();
    assert.strictEqual(component.url.validationErrors.length, 1);
    assert.strictEqual(component.url.validationErrors[0].text, 'This field must be a valid url');
    await component.url.set('https://validurl.edu/');
    assert.strictEqual(component.url.validationErrors.length, 0);
    await component.url.set('https://validurl.edu/but-way-too-long/' + '0123456789'.repeat(25));
    assert.strictEqual(component.url.validationErrors.length, 1);
    assert.strictEqual(
      component.url.validationErrors[0].text,
      'This field is too long (maximum is 256 characters)',
    );
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
    assert.strictEqual(component.fileUpload.validationErrors.length, 0);
    await component.save();
    assert.strictEqual(component.fileUpload.validationErrors[0].text, 'Missing file');
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
    assert.notOk(component.hasAgreementValidationError);
    await component.save();
    assert.ok(component.hasAgreementValidationError);
    await component.agreement();
    assert.notOk(component.hasAgreementValidationError);
    await component.agreement();
    assert.ok(component.hasAgreementValidationError);
    await component.rationale('rationale');
    assert.notOk(component.hasAgreementValidationError);
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
    assert.notOk(component.hasAuthorValidationError);
    await component.save();
    assert.ok(component.hasAuthorValidationError);

    await component.author('author');
    assert.notOk(component.hasAuthorValidationError);

    await component.author('a');
    assert.ok(component.hasAuthorValidationError);

    await component.author('longer author');
    assert.notOk(component.hasAuthorValidationError);

    await component.author('super long author'.repeat(20));
    assert.ok(component.hasAuthorValidationError);
  });

  test('validate title', async function (assert) {
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
    assert.notOk(component.hasTitleValidationError);
    await component.save();
    assert.ok(component.hasTitleValidationError);

    await component.name('title');
    assert.notOk(component.hasTitleValidationError);

    await component.name('t');
    assert.ok(component.hasTitleValidationError);

    await component.name('longer title');
    assert.notOk(component.hasTitleValidationError);

    await component.name('super long title'.repeat(20));
    assert.ok(component.hasTitleValidationError);
  });
});
