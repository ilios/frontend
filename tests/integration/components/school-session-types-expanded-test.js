import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-session-types-expanded';

module('Integration | Component | school session types expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.server.create('assessment-option', {
      name: 'formative',
    });
    this.summative = this.server.create('assessment-option', {
      name: 'summative',
    });
    const sessionType = this.server.create('session-type', {
      id: 1,
      title: 'one',
      calendarColor: '#ffffff',
      assessment: true,
    });
    const school = this.server.create('school', {
      id: 1,
      sessionTypes: [sessionType],
    });
    this.school = await this.owner.lookup('service:store').find('school', school.id);
    this.sessionType = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
  });

  test('it renders empty', async function (assert) {
    this.school.set('sessionTypes', []);
    this.set('school', this.school);
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{this.school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @managedSessionTypeId={{null}}
      @setSchoolManagedSessionType={{(noop)}}
      @setSchoolNewSessionType={{(noop)}}
    />`);

    assert.notOk(component.list.sessionTypes.isVisible);
    assert.strictEqual(component.title, 'Session Types (0)');
  });

  test('it renders', async function (assert) {
    this.set('school', this.school);
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{this.school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @managedSessionTypeId={{null}}
      @setSchoolManagedSessionType={{(noop)}}
      @setSchoolNewSessionType={{(noop)}}
    />`);

    assert.strictEqual(component.list.sessionTypes.length, 1);
    assert.strictEqual(component.title, 'Session Types (1)');
  });

  test('it renders as manager', async function (assert) {
    this.set('school', this.school);
    this.set('sessionType', this.sessionType);
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{this.school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @managedSessionTypeId={{this.sessionType.id}}
      @setSchoolManagedSessionType={{(noop)}}
      @setSchoolNewSessionType={{(noop)}}
    />`);

    assert.ok(component.manager.isVisible);
  });

  test('editing session type fires action', async function (assert) {
    assert.expect(1);
    this.set('school', this.school);
    this.set('click', (id) => {
      assert.strictEqual(parseInt(id, 10), 1);
    });
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{this.school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @managedSessionTypeId={{null}}
      @setSchoolManagedSessionType={{this.click}}
      @setSchoolNewSessionType={{(noop)}}
    />`);

    await component.list.sessionTypes[0].manage();
  });

  test('clicking add new session fires action', async function (assert) {
    assert.expect(1);
    this.set('school', this.school);
    this.set('click', (isExpanded) => {
      assert.true(isExpanded);
    });
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{this.school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @managedSessionTypeId={{null}}
      @setSchoolManagedSessionType={{(noop)}}
      @setSchoolNewSessionType={{this.click}}
    />`);

    await component.createNew();
  });

  test('close fires action', async function (assert) {
    assert.expect(1);
    this.set('school', this.school);
    this.set('sessionType', this.sessionType);
    this.set('click', (id) => {
      assert.strictEqual(id, null);
    });
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{this.school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @managedSessionTypeId={{sessionType.id}}
      @setSchoolManagedSessionType={{this.click}}
      @setSchoolNewSessionType={{(noop)}}
    />`);

    await component.newSessionType.cancel.click();
  });

  test('collapse fires action', async function (assert) {
    assert.expect(1);
    this.set('school', this.school);
    this.set('click', () => {
      assert.ok(true, 'action was fired');
    });
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{this.school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{this.click}}
      @expand={{(noop)}}
      @managedSessionTypeId={{null}}
      @setSchoolManagedSessionType={{(noop)}}
      @setSchoolNewSessionType={{(noop)}}
    />`);

    await component.collapse();
  });
});
