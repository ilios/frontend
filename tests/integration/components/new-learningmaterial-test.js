import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupAuthentication } from 'ilios-common';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/new-learningmaterial';
import { setupMirage } from 'ember-cli-mirage/test-support';

// @todo flesh this integration test out [ST 2020/09/02]
module('Integration | Component | new learningmaterial', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('owning user has additional info', async function (assert) {
    this.school = this.server.create('school');
    await setupAuthentication({ school: this.school, displayName: 'Clem Chowder' });
    this.set('type', 'citation');
    await render(hbs`
      <NewLearningmaterial
        @type={{this.type}}
        @learningMaterialStatuses={{array}}
        @learningMaterialUserRoles={{array}}
        @save={{noop}}
        @cancel={{noop}}
      />
   `);
    assert.equal(component.owningUser.userNameInfo.fullName, 'Clem Chowder');
    assert.ok(component.owningUser.userNameInfo.hasAdditionalInfo);
    assert.notOk(component.owningUser.userNameInfo.isTooltipVisible);
    await component.owningUser.userNameInfo.expandTooltip();
    assert.ok(component.owningUser.userNameInfo.isTooltipVisible);
    assert.equal(component.owningUser.userNameInfo.tooltipContents, 'Campus name of record: 0 guy M, Mc0son');
    await component.owningUser.userNameInfo.closeTooltip();
    assert.notOk(component.owningUser.userNameInfo.isTooltipVisible);
  });
});
