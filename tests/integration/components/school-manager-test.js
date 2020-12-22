import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | school manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<SchoolManager
      @school={{school}}
      @setSchoolCompetencyDetails={{noop}}
      @setSchoolManageCompetencies={{noop}}
      @setSchoolVocabularyDetails={{noop}}
      @setSchoolLeadershipDetails={{noop}}
      @setSchoolManageLeadership={{noop}}
      @setSchoolSessionAttributesDetails={{noop}}
      @setSchoolManageSessionAttributes={{noop}}
      @setSchoolSessionTypeDetails={{noop}}
      @setSchoolManagedSessionType={{noop}}
    />`);

    assert.ok(this.element.textContent.includes("Back to Schools List"));
  });
});
