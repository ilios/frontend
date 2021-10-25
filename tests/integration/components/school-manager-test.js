import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-manager';

module('Integration | Component | school manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.server.create('user', { school, administeredSchools: [school] });
    this.server.create('user', { school, administeredSchools: [school] });
    this.server.createList('vocabulary', 2, { school });
    this.server.createList('sessionType', 2, { school });
    this.server.createList('competency', 2, { school });
    this.store = this.owner.lookup('service:store');
    this.school = await this.store.findRecord('school', school.id);
  });

  test('it renders expanded', async function (assert) {
    this.set('school', this.school);
    await render(hbs`<SchoolManager
      @school={{this.school}}
      @canUpdateSchool={{true}}
      @canUpdateCompetency={{true}}
      @canDeleteCompetency={{true}}
      @canCreateCompetency={{true}}
      @canUpdateVocabulary={{true}}
      @canDeleteVocabulary={{true}}
      @canCreateVocabulary={{true}}
      @canUpdateTerm={{true}}
      @canDeleteTerm={{true}}
      @canCreateTerm={{true}}
      @canUpdateSessionType={{true}}
      @canDeleteSessionType={{true}}
      @canCreateSessionType={{true}}
      @canUpdateSchoolConfig={{true}}
      @schoolCompetencyDetails={{true}}
      @setSchoolCompetencyDetails={{(noop)}}
      @schoolManageCompetencies={{true}}
      @setSchoolManageCompetencies={{(noop)}}
      @schoolVocabularyDetails={{true}}
      @setSchoolVocabularyDetails={{(noop)}}
      @schoolManagedVocabulary={{true}}
      @setSchoolManagedVocabulary={{(noop)}}
      @schoolManagedVocabularyTerm={{true}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
      @schoolLeadershipDetails={{true}}
      @setSchoolLeadershipDetails={{(noop)}}
      @schoolManageLeadership={{true}}
      @setSchoolManageLeadership={{(noop)}}
      @schoolSessionAttributesDetails={{true}}
      @setSchoolSessionAttributesDetails={{(noop)}}
      @schoolManageSessionAttributes={{true}}
      @setSchoolManageSessionAttributes={{(noop)}}
      @schoolSessionTypeDetails={{true}}
      @setSchoolSessionTypeDetails={{(noop)}}
      @schoolManagedSessionType={{true}}
      @setSchoolManagedSessionType={{(noop)}}
      @schoolNewSessionType={{true}}
      @setSchoolNewSessionType={{(noop)}}
      @schoolManageInstitution={{true}}
      @setSchoolManageInstitution={{(noop)}}
      @schoolNewVocabulary={{true}}
      @setSchoolNewVocabulary={{(noop)}}
    />`);

    assert.ok(component.schoolLeadershipExpanded.isVisible);
    assert.notOk(component.schoolLeadershipCollapsed.isVisible);
    assert.ok(component.schoolCompetenciesExpanded.isVisible);
    assert.notOk(component.schoolCompetenciesCollapsed.isVisible);
    assert.ok(component.schoolVocabulariesExpanded.isVisible);
    assert.notOk(component.schoolVocabulariesCollapsed.isVisible);
    assert.ok(component.schoolSessionTypesExpanded.isVisible);
    assert.notOk(component.schoolSessionTypesCollapsed.isVisible);
    assert.ok(component.schoolSessionAttributes.expanded.isVisible);
    assert.notOk(component.schoolSessionAttributes.collapsed.isVisible);
    assert.ok(component.schoolCurriculumInventoryInstitutionManager.isVisible);
    assert.notOk(component.schoolCurriculumInventoryInstitutionDetails.isVisible);
  });

  test('it renders collapsed', async function (assert) {
    this.set('school', this.school);
    await render(hbs`<SchoolManager
      @school={{this.school}}
      @canUpdateSchool={{true}}
      @canUpdateCompetency={{true}}
      @canDeleteCompetency={{true}}
      @canCreateCompetency={{true}}
      @canUpdateVocabulary={{true}}
      @canDeleteVocabulary={{true}}
      @canCreateVocabulary={{true}}
      @canUpdateTerm={{true}}
      @canDeleteTerm={{true}}
      @canCreateTerm={{true}}
      @canUpdateSessionType={{true}}
      @canDeleteSessionType={{true}}
      @canCreateSessionType={{true}}
      @canUpdateSchoolConfig={{true}}
      @schoolCompetencyDetails={{false}}
      @setSchoolCompetencyDetails={{(noop)}}
      @schoolManageCompetencies={{false}}
      @setSchoolManageCompetencies={{(noop)}}
      @schoolVocabularyDetails={{false}}
      @setSchoolVocabularyDetails={{(noop)}}
      @schoolManagedVocabulary={{false}}
      @setSchoolManagedVocabulary={{(noop)}}
      @schoolManagedVocabularyTerm={{false}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
      @schoolLeadershipDetails={{false}}
      @setSchoolLeadershipDetails={{(noop)}}
      @schoolManageLeadership={{false}}
      @setSchoolManageLeadership={{(noop)}}
      @schoolSessionAttributesDetails={{false}}
      @setSchoolSessionAttributesDetails={{(noop)}}
      @schoolManageSessionAttributes={{false}}
      @setSchoolManageSessionAttributes={{(noop)}}
      @schoolSessionTypeDetails={{false}}
      @setSchoolSessionTypeDetails={{(noop)}}
      @schoolManagedSessionType={{false}}
      @setSchoolManagedSessionType={{(noop)}}
      @schoolNewSessionType={{false}}
      @setSchoolNewSessionType={{(noop)}}
      @schoolManageInstitution={{false}}
      @setSchoolManageInstitution={{(noop)}}
      @schoolNewVocabulary={{false}}
      @setSchoolNewVocabulary={{(noop)}}
    />`);

    assert.notOk(component.schoolLeadershipExpanded.isVisible);
    assert.ok(component.schoolLeadershipCollapsed.isVisible);
    assert.notOk(component.schoolCompetenciesExpanded.isVisible);
    assert.ok(component.schoolCompetenciesCollapsed.isVisible);
    assert.notOk(component.schoolVocabulariesExpanded.isVisible);
    assert.ok(component.schoolVocabulariesCollapsed.isVisible);
    assert.notOk(component.schoolSessionTypesExpanded.isVisible);
    assert.ok(component.schoolSessionTypesCollapsed.isVisible);
    assert.notOk(component.schoolSessionAttributes.expanded.isVisible);
    assert.ok(component.schoolSessionAttributes.collapsed.isVisible);
    assert.notOk(component.schoolCurriculumInventoryInstitutionManager.isVisible);
    assert.ok(component.schoolCurriculumInventoryInstitutionDetails.isVisible);
  });

  test('change title', async function (assert) {
    const newTitle = 'foo bar';
    this.set('school', this.school);
    await render(hbs`<SchoolManager
      @school={{this.school}}
      @canUpdateSchool={{true}}
      @canUpdateCompetency={{true}}
      @canDeleteCompetency={{true}}
      @canCreateCompetency={{true}}
      @canUpdateVocabulary={{true}}
      @canDeleteVocabulary={{true}}
      @canCreateVocabulary={{true}}
      @canUpdateTerm={{true}}
      @canDeleteTerm={{true}}
      @canCreateTerm={{true}}
      @canUpdateSessionType={{true}}
      @canDeleteSessionType={{true}}
      @canCreateSessionType={{true}}
      @canUpdateSchoolConfig={{true}}
      @schoolCompetencyDetails={{false}}
      @setSchoolCompetencyDetails={{(noop)}}
      @schoolManageCompetencies={{false}}
      @setSchoolManageCompetencies={{(noop)}}
      @schoolMapCompetencies={{false}}
      @setSchoolMapCompetencies={{(noop)}}
      @schoolVocabularyDetails={{false}}
      @setSchoolVocabularyDetails={{(noop)}}
      @schoolManagedVocabulary={{false}}
      @setSchoolManagedVocabulary={{(noop)}}
      @schoolManagedVocabularyTerm={{false}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
      @schoolLeadershipDetails={{false}}
      @setSchoolLeadershipDetails={{(noop)}}
      @schoolManageLeadership={{false}}
      @setSchoolManageLeadership={{(noop)}}
      @schoolSessionAttributesDetails={{false}}
      @setSchoolSessionAttributesDetails={{(noop)}}
      @schoolManageSessionAttributes={{false}}
      @setSchoolManageSessionAttributes={{(noop)}}
      @schoolSessionTypeDetails={{false}}
      @setSchoolSessionTypeDetails={{(noop)}}
      @schoolManagedSessionType={{false}}
      @setSchoolManagedSessionType={{(noop)}}
      @schoolNewSessionType={{false}}
      @setSchoolNewSessionType={{(noop)}}
      @schoolManageInstitution={{false}}
      @setSchoolManageInstitution={{(noop)}}
      @schoolNewVocabulary={{false}}
      @setSchoolNewVocabulary={{(noop)}}
    />`);

    assert.equal(component.title.text, 'school 0');
    assert.notOk(component.title.hasError);
    await component.title.edit();
    await component.title.set(newTitle);
    await component.title.save();
    assert.notOk(component.title.hasError);
    assert.equal(this.school.title, newTitle);
    assert.equal(component.title.text, newTitle);
  });

  test('cancel title changes', async function (assert) {
    const newTitle = 'foo bar';
    this.set('school', this.school);
    await render(hbs`<SchoolManager
      @school={{this.school}}
      @canUpdateSchool={{true}}
      @canUpdateCompetency={{true}}
      @canDeleteCompetency={{true}}
      @canCreateCompetency={{true}}
      @canUpdateVocabulary={{true}}
      @canDeleteVocabulary={{true}}
      @canCreateVocabulary={{true}}
      @canUpdateTerm={{true}}
      @canDeleteTerm={{true}}
      @canCreateTerm={{true}}
      @canUpdateSessionType={{true}}
      @canDeleteSessionType={{true}}
      @canCreateSessionType={{true}}
      @canUpdateSchoolConfig={{true}}
      @schoolCompetencyDetails={{false}}
      @setSchoolCompetencyDetails={{(noop)}}
      @schoolManageCompetencies={{false}}
      @setSchoolManageCompetencies={{(noop)}}
      @schoolMapCompetencies={{false}}
      @setSchoolMapCompetencies={{(noop)}}
      @schoolVocabularyDetails={{false}}
      @setSchoolVocabularyDetails={{(noop)}}
      @schoolManagedVocabulary={{false}}
      @setSchoolManagedVocabulary={{(noop)}}
      @schoolManagedVocabularyTerm={{false}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
      @schoolLeadershipDetails={{false}}
      @setSchoolLeadershipDetails={{(noop)}}
      @schoolManageLeadership={{false}}
      @setSchoolManageLeadership={{(noop)}}
      @schoolSessionAttributesDetails={{false}}
      @setSchoolSessionAttributesDetails={{(noop)}}
      @schoolManageSessionAttributes={{false}}
      @setSchoolManageSessionAttributes={{(noop)}}
      @schoolSessionTypeDetails={{false}}
      @setSchoolSessionTypeDetails={{(noop)}}
      @schoolManagedSessionType={{false}}
      @setSchoolManagedSessionType={{(noop)}}
      @schoolNewSessionType={{false}}
      @setSchoolNewSessionType={{(noop)}}
      @schoolManageInstitution={{false}}
      @setSchoolManageInstitution={{(noop)}}
      @schoolNewVocabulary={{false}}
      @setSchoolNewVocabulary={{(noop)}}
    />`);

    assert.equal(component.title.text, 'school 0');
    await component.title.edit();
    await component.title.set(newTitle);
    await component.title.cancel();
    assert.equal(this.school.title, 'school 0');
    assert.equal(component.title.text, 'school 0');
  });

  test('validation fails if title is too short', async function (assert) {
    this.set('school', this.school);
    await render(hbs`<SchoolManager
      @school={{this.school}}
      @canUpdateSchool={{true}}
      @canUpdateCompetency={{true}}
      @canDeleteCompetency={{true}}
      @canCreateCompetency={{true}}
      @canUpdateVocabulary={{true}}
      @canDeleteVocabulary={{true}}
      @canCreateVocabulary={{true}}
      @canUpdateTerm={{true}}
      @canDeleteTerm={{true}}
      @canCreateTerm={{true}}
      @canUpdateSessionType={{true}}
      @canDeleteSessionType={{true}}
      @canCreateSessionType={{true}}
      @canUpdateSchoolConfig={{true}}
      @schoolCompetencyDetails={{false}}
      @setSchoolCompetencyDetails={{(noop)}}
      @schoolManageCompetencies={{false}}
      @setSchoolManageCompetencies={{(noop)}}
      @schoolMapCompetencies={{false}}
      @setSchoolMapCompetencies={{(noop)}}
      @schoolVocabularyDetails={{false}}
      @setSchoolVocabularyDetails={{(noop)}}
      @schoolManagedVocabulary={{false}}
      @setSchoolManagedVocabulary={{(noop)}}
      @schoolManagedVocabularyTerm={{false}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
      @schoolLeadershipDetails={{false}}
      @setSchoolLeadershipDetails={{(noop)}}
      @schoolManageLeadership={{false}}
      @setSchoolManageLeadership={{(noop)}}
      @schoolSessionAttributesDetails={{false}}
      @setSchoolSessionAttributesDetails={{(noop)}}
      @schoolManageSessionAttributes={{false}}
      @setSchoolManageSessionAttributes={{(noop)}}
      @schoolSessionTypeDetails={{false}}
      @setSchoolSessionTypeDetails={{(noop)}}
      @schoolManagedSessionType={{false}}
      @setSchoolManagedSessionType={{(noop)}}
      @schoolNewSessionType={{false}}
      @setSchoolNewSessionType={{(noop)}}
      @schoolManageInstitution={{false}}
      @setSchoolManageInstitution={{(noop)}}
      @schoolNewVocabulary={{false}}
      @setSchoolNewVocabulary={{(noop)}}
    />`);

    assert.equal(component.title.text, 'school 0');
    assert.notOk(component.title.hasError);
    await component.title.edit();
    await component.title.set('');
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('validation fails if title is too long', async function (assert) {
    this.set('school', this.school);
    await render(hbs`<SchoolManager
      @school={{this.school}}
      @canUpdateSchool={{true}}
      @canUpdateCompetency={{true}}
      @canDeleteCompetency={{true}}
      @canCreateCompetency={{true}}
      @canUpdateVocabulary={{true}}
      @canDeleteVocabulary={{true}}
      @canCreateVocabulary={{true}}
      @canUpdateTerm={{true}}
      @canDeleteTerm={{true}}
      @canCreateTerm={{true}}
      @canUpdateSessionType={{true}}
      @canDeleteSessionType={{true}}
      @canCreateSessionType={{true}}
      @canUpdateSchoolConfig={{true}}
      @schoolCompetencyDetails={{false}}
      @setSchoolCompetencyDetails={{(noop)}}
      @schoolManageCompetencies={{false}}
      @setSchoolManageCompetencies={{(noop)}}
      @schoolMapCompetencies={{false}}
      @setSchoolMapCompetencies={{(noop)}}
      @schoolVocabularyDetails={{false}}
      @setSchoolVocabularyDetails={{(noop)}}
      @schoolManagedVocabulary={{false}}
      @setSchoolManagedVocabulary={{(noop)}}
      @schoolManagedVocabularyTerm={{false}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
      @schoolLeadershipDetails={{false}}
      @setSchoolLeadershipDetails={{(noop)}}
      @schoolManageLeadership={{false}}
      @setSchoolManageLeadership={{(noop)}}
      @schoolSessionAttributesDetails={{false}}
      @setSchoolSessionAttributesDetails={{(noop)}}
      @schoolManageSessionAttributes={{false}}
      @setSchoolManageSessionAttributes={{(noop)}}
      @schoolSessionTypeDetails={{false}}
      @setSchoolSessionTypeDetails={{(noop)}}
      @schoolManagedSessionType={{false}}
      @setSchoolManagedSessionType={{(noop)}}
      @schoolNewSessionType={{false}}
      @setSchoolNewSessionType={{(noop)}}
      @schoolManageInstitution={{false}}
      @setSchoolManageInstitution={{(noop)}}
      @schoolNewVocabulary={{false}}
      @setSchoolNewVocabulary={{(noop)}}
    />`);

    assert.equal(component.title.text, 'school 0');
    assert.notOk(component.title.hasError);
    await component.title.edit();
    await component.title.set('0123456789'.repeat(21));
    await component.title.save();
    assert.ok(component.title.hasError);
  });
});
