import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-list';

module('Integration | Component | school list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    this.school1 = await this.owner.lookup('service:store').find('school', school1.id);
    this.school2 = await this.owner.lookup('service:store').find('school', school2.id);
  });

  test('it renders', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    await render(hbs`<SchoolList @schools={{this.schools}} />`);
    assert.strictEqual(component.schools.length, 2);
    assert.strictEqual(component.schools[0].title, 'school 0');
    assert.strictEqual(component.schools[1].title, 'school 1');
  });

  test('create school button is visible to root', async function (assert) {
    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`<SchoolList @schools={{this.schools}} />`);
    assert.ok(component.expandCollapseButton.isVisible);
  });

  test('create school button is not visible to non root users', async function (assert) {
    const currentUserMock = Service.extend({
      isRoot: false,
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`<SchoolList @schools={{this.schools}} />`);
    assert.notOk(component.expandCollapseButton.isVisible);
  });

  test('toggle visibility of new school form', async function (assert) {
    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`<SchoolList @schools={{this.schools}} />`);
    assert.notOk(component.newSchoolForm.isVisible);
    await component.expandCollapseButton.toggle();
    assert.ok(component.newSchoolForm.isVisible);
    await component.expandCollapseButton.toggle();
    assert.notOk(component.newSchoolForm.isVisible);
    await component.expandCollapseButton.toggle();
    assert.ok(component.newSchoolForm.isVisible);
    await component.newSchoolForm.cancel();
    assert.notOk(component.newSchoolForm.isVisible);
  });

  test('create new school', async function (assert) {
    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`<SchoolList @schools={{this.schools}} />`);
    await component.expandCollapseButton.toggle();

    let schools = (await this.owner.lookup('service:store').findAll('school')).toArray();
    assert.strictEqual(schools.length, 2);
    assert.notOk(component.savedSchool.isVisible);
    component.newSchoolForm.title.set('school of rocket surgery');
    component.newSchoolForm.email.set('rocketsurgeongeneral@hoekacademy.edu');
    await component.newSchoolForm.submit();
    assert.ok(component.savedSchool.isVisible);
    assert.strictEqual(component.savedSchool.text, 'school of rocket surgery Saved Successfully');
    schools = (await this.owner.lookup('service:store').findAll('school')).toArray();
    assert.strictEqual(schools.length, 3);
    assert.strictEqual(schools[2].title, 'school of rocket surgery');
    assert.strictEqual(schools[2].iliosAdministratorEmail, 'rocketsurgeongeneral@hoekacademy.edu');
  });

  test('submit empty form fails', async function (assert) {
    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`<SchoolList @schools={{this.schools}} />`);
    await component.expandCollapseButton.toggle();
    assert.notOk(component.newSchoolForm.title.hasError);
    assert.notOk(component.newSchoolForm.email.hasError);
    await component.newSchoolForm.submit();
    assert.ok(component.newSchoolForm.title.hasError);
    assert.ok(component.newSchoolForm.email.hasError);
  });

  test('email validation works', async function (assert) {
    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('schools', []);
    await render(hbs`<SchoolList @schools={{this.schools}} />`);
    await component.expandCollapseButton.toggle();
    assert.notOk(component.newSchoolForm.email.hasError);
    await component.newSchoolForm.email.set('thisisnotanemailaddress');
    await component.newSchoolForm.email.submit();
    assert.ok(component.newSchoolForm.email.hasError);
    await component.newSchoolForm.email.set('but@this.is');
    await component.newSchoolForm.email.submit();
    assert.notOk(component.newSchoolForm.email.hasError);
  });
});
