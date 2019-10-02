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
    this.set('nothing', () => { });
    this.set('school', schoolModel);
    await render(hbs`<SchoolManager
      @school={{school}}
      @setSchoolCompetencyDetails={{action nothing}}
      @setSchoolManageCompetencies={{action nothing}}
      @setSchoolVocabularyDetails={{action nothing}}
      @setSchoolLeadershipDetails={{action nothing}}
      @setSchoolManageLeadership={{action nothing}}
      @setSchoolSessionAttributesDetails={{action nothing}}
      @setSchoolManageSessionAttributes={{action nothing}}
      @setSchoolSessionTypeDetails={{action nothing}}
      @setSchoolManagedSessionType={{action nothing}}
    />`);

    assert.ok(this.element.textContent.includes("Back to Schools List"));
  });
});
