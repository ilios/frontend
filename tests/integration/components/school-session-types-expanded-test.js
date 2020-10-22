import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | school session types expanded', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.server.create('assessment-option', {
      name: 'formative'
    });
    this.summative = this.server.create('assessment-option', {
      name: 'summative'
    });
    const sessionType = this.server.create('session-type', {
      id: 1,
      title: 'one',
      calendarColor: '#ffffff',
      assessment: true,
    });
    const school = this.server.create('school', {
      id: 1,
      sessionTypes: [sessionType]
    });
    this.school = await this.owner.lookup('service:store').find('school', school.id);
    this.sessionType = await this.owner.lookup('service:store').find('session-type', sessionType.id);
  });

  test('it renders', async function(assert) {
    this.set('school', this.school);
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{noop}}
      @expand={{noop}}
      @managedSessionTypeId={{null}}
      @setSchoolManagedSessionType={{noop}}
      @setSchoolNewSessionType={{noop}}
    />`);

    const title = '.title';
    const table = 'table';
    const sessionTypes = `${table} tbody tr`;

    assert.dom(title).hasText('Session Types');
    assert.dom(sessionTypes).exists({ count: 1 });
  });

  test('it renders as manager', async function(assert) {
    this.set('school', this.school);
    this.set('sessionType', this.sessionType);
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{noop}}
      @expand={{noop}}
      @managedSessionTypeId={{this.sessionType.id}}
      @setSchoolManagedSessionType={{noop}}
      @setSchoolNewSessionType={{noop}}
    />`);

    const title = '.title';
    const sessionTypeTitle = '.session-type-title';
    const form = '.form';
    const items = `${form} .item`;

    assert.dom(title).hasText('Session Types');
    assert.dom(sessionTypeTitle).hasText('one');
    assert.dom(items).exists({ count: 6 });
  });

  test('editing session type fires action', async function(assert) {
    assert.expect(1);
    this.set('school', this.school);
    this.set('click', id => {
      assert.equal(id, 1);
    });
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{noop}}
      @expand={{noop}}
      @managedSessionTypeId={{null}}
      @setSchoolManagedSessionType={{this.click}}
      @setSchoolNewSessionType={{noop}}
    />`);

    const table = 'table';
    const sessionTypes = `${table} tbody tr`;
    const edit = `${sessionTypes}:nth-of-type(1) td:nth-of-type(7) .edit`;

    await click(edit);
  });

  test('clicking expand new session fires action', async function(assert) {
    assert.expect(1);
    this.set('school', this.school);
    this.set('click', isExpanded => {
      assert.equal(isExpanded, true);
    });
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{noop}}
      @expand={{noop}}
      @managedSessionTypeId={{null}}
      @setSchoolManagedSessionType={{noop}}
      @setSchoolNewSessionType={{this.click}}
    />`);
    const edit = `.expand-collapse-button button`;

    await click(edit);
  });

  test('close fires action', async function(assert) {
    assert.expect(1);
    this.set('school', this.school);
    this.set('sessionType', this.sessionType);
    this.set('click', id => {
      assert.equal(id, null);
    });
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{noop}}
      @expand={{noop}}
      @managedSessionTypeId={{sessionType.id}}
      @setSchoolManagedSessionType={{this.click}}
      @setSchoolNewSessionType={{noop}}
    />`);
    const form = '.form';
    const button = `${form} .cancel`;
    await click(button);
  });

  test('collapse fires action', async function(assert) {
    assert.expect(1);
    this.set('school', this.school);
    this.set('click', () => {
      assert.ok(true, 'action was fired');
    });
    await render(hbs`<SchoolSessionTypesExpanded
      @school={{school}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @collapse={{this.click}}
      @expand={{noop}}
      @managedSessionTypeId={{null}}
      @setSchoolManagedSessionType={{noop}}
      @setSchoolNewSessionType={{noop}}
    />`);
    const title = '.title';
    await click(title);
  });
});
