import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/school-session-types-list-item';

module('Integration | Component | school-session-types-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const assessmentOption = this.server.create('assessment-option', {
      id: 1,
      name: 'formative',
    });
    const aamcMethod1 = this.server.create('aamc-method', {
      id: 'AM001',
      description: 'Lorem Ipsum',
      active: true,
    });
    const aamcMethod2 = this.server.create('aamc-method', {
      id: 'AM002',
      description: 'Dolor Et',
      active: false,
    });
    const sessionType = this.server.create('session-type', {
      school,
      title: 'salt',
      assessment: true,
      assessmentOption,
      calendarColor: '#cccccc',
      aamcMethods: [aamcMethod1, aamcMethod2],
      sessions: this.server.createList('session', 2),
      active: true,
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    await render(hbs`<SchoolSessionTypesListItem
      @sessionType={{this.sessionType}}
      @canDelete={{true}}
      @manageSessionType={{(noop)}}
    />`);
    assert.strictEqual(component.title.text, 'salt');
    assert.strictEqual(component.sessionCount, '2');
    assert.ok(component.isAssessment);
    assert.strictEqual(component.aamcMethod, aamcMethod1.description);
    assert.strictEqual(component.assessmentOption, 'formative');
    assert.strictEqual(component.calendarColor, 'background-color: #cccccc');
  });

  test('clicking edit fires action', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const sessionType = this.server.create('session-type', {
      school,
      title: 'first',
      assessment: false,
      calendarColor: '#fff',
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    this.set('manageSessionType', (sessionTypeId) => {
      assert.strictEqual(parseInt(sessionTypeId, 10), 1);
    });
    await render(hbs`<SchoolSessionTypesListItem
      @sessionType={{this.sessionType}}
      @canDelete={{true}}
      @manageSessionType={{this.manageSessionType}}
    />`);
    await component.manage();
  });

  test('clicking title fires action', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const sessionType = this.server.create('session-type', {
      school,
      title: 'first',
      assessment: false,
      calendarColor: '#fff',
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    this.set('manageSessionType', (sessionTypeId) => {
      assert.strictEqual(parseInt(sessionTypeId, 10), 1);
    });
    await render(hbs`<SchoolSessionTypesListItem
      @sessionType={{this.sessionType}}
      @canDelete={{true}}
      @manageSessionType={{this.manageSessionType}}
    />`);
    await component.title.edit();
  });

  test('session type without sessions can be deleted', async function (assert) {
    const school = this.server.create('school');
    const sessionType = this.server.create('session-type', {
      school,
      title: 'unlinked',
      assessment: false,
      active: true,
      calendarColor: '#fff',
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    await render(hbs`<SchoolSessionTypesListItem
      @sessionType={{this.sessionType}}
      @canDelete={{true}}
      @manageSessionType={{(noop)}}
    />`);
    assert.ok(component.isDeletable);
  });

  test("session type without sessions cannot be deleted if user permissions won't allow it", async function (assert) {
    const school = this.server.create('school');
    const sessionType = this.server.create('session-type', {
      school,
      title: 'unlinked',
      assessment: false,
      active: true,
      calendarColor: '#fff',
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    await render(hbs`<SchoolSessionTypesListItem
      @sessionType={{this.sessionType}}
      @canDelete={{false}}
      @manageSessionType={{(noop)}}
    />`);
    assert.notOk(component.isDeletable);
  });

  test('session type with sessions cannot be deleted', async function (assert) {
    const school = this.server.create('school');
    const sessionType = this.server.create('session-type', {
      school,
      title: 'linked',
      active: true,
      assessment: false,
      calendarColor: '#fff',
      sessions: this.server.createList('session', 5),
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    await render(hbs`<SchoolSessionTypesListItem
      @sessionType={{this.sessionType}}
      @canDelete={{true}}
      @manageSessionType={{(noop)}}
    />`);
    assert.notOk(component.isDeletable);
  });
});
