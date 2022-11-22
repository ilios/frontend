import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { setupAuthentication } from 'ilios-common';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/new-learningmaterial';
import { setupMirage } from 'ember-cli-mirage/test-support';

// @todo flesh this integration test out [ST 2020/09/02]
module('Integration | Component | new learningmaterial', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
    await render(hbs`
      <NewLearningmaterial
        @type={{this.type}}
        @learningMaterialStatuses={{(array)}}
        @learningMaterialUserRoles={{(array)}}
        @save={{(noop)}}
        @cancel={{(noop)}}
      />
   
`);
    assert.strictEqual(component.owningUser.userNameInfo.fullName, 'Clem Chowder');
    assert.ok(component.owningUser.userNameInfo.hasAdditionalInfo);
    assert.notOk(component.owningUser.userNameInfo.isTooltipVisible);
    await component.owningUser.userNameInfo.expandTooltip();
    assert.ok(component.owningUser.userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.owningUser.userNameInfo.tooltipContents,
      'Campus name of record: 0 guy M, Mc0son'
    );
    await component.owningUser.userNameInfo.closeTooltip();
    assert.notOk(component.owningUser.userNameInfo.isTooltipVisible);
  });

  test('link validation', async function (assert) {
    this.set('type', 'link');
    await render(hbs`
      <NewLearningmaterial
        @type={{this.type}}
        @learningMaterialStatuses={{(array)}}
        @learningMaterialUserRoles={{(array)}}
        @save={{(noop)}}
        @cancel={{(noop)}}
      />
   
`);
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
      'This field is too long (maximum is 256 characters)'
    );
  });

  test('missing file', async function (assert) {
    this.set('type', 'file');
    await render(hbs`
      <NewLearningmaterial
        @type={{this.type}}
        @learningMaterialStatuses={{(array)}}
        @learningMaterialUserRoles={{(array)}}
        @save={{(noop)}}
        @cancel={{(noop)}}
      />
   
`);
    assert.strictEqual(component.fileUpload.validationErrors.length, 0);
    await component.save();
    assert.strictEqual(component.fileUpload.validationErrors[0].text, 'Missing file');
  });
});
