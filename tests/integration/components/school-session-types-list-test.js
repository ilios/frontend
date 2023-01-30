import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/school-session-types-list';

module('Integration | Component | school session types list', function (hooks) {
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
    this.server.create('session-type', {
      school,
      title: 'not needed anymore',
      assessment: false,
      calendarColor: '#ffffff',
      aamcMethods: [aamcMethod1],
      sessions: this.server.createList('session', 2),
      active: false,
    });

    this.server.create('session-type', {
      school,
      title: 'second',
      assessment: true,
      assessmentOption,
      calendarColor: '#123456',
      aamcMethods: [aamcMethod2],
      active: true,
    });
    this.server.create('session-type', {
      school,
      title: 'first',
      assessment: false,
      calendarColor: '#cccccc',
      aamcMethods: [aamcMethod1],
      sessions: this.server.createList('session', 2),
      active: true,
    });

    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');
    this.set('sessionTypes', sessionTypeModels);
    await render(
      hbs`<SchoolSessionTypesList @sessionTypes={{this.sessionTypes}} @manageSessionType={{(noop)}} />`
    );

    assert.strictEqual(component.sessionTypes.length, 3);
    assert.strictEqual(component.sessionTypes[0].title.text, 'first');
    assert.ok(component.sessionTypes[0].isActive);
    assert.strictEqual(component.sessionTypes[0].sessionCount, '2');
    assert.notOk(component.sessionTypes[0].isAssessment);
    assert.strictEqual(component.sessionTypes[0].aamcMethod, aamcMethod1.description);
    assert.strictEqual(component.sessionTypes[0].assessmentOption, '');
    assert.strictEqual(component.sessionTypes[0].calendarColor, 'background-color: #cccccc');
    assert.strictEqual(component.sessionTypes[1].title.text, 'second');
    assert.ok(component.sessionTypes[1].isActive);
    assert.strictEqual(component.sessionTypes[1].sessionCount, '0');
    assert.ok(component.sessionTypes[1].isAssessment);
    assert.strictEqual(component.sessionTypes[1].aamcMethod, aamcMethod2.description);
    assert.strictEqual(component.sessionTypes[1].assessmentOption, 'formative');
    assert.strictEqual(component.sessionTypes[1].calendarColor, 'background-color: #123456');
    assert.strictEqual(component.sessionTypes[2].title.text, 'not needed anymore');
    assert.ok(component.sessionTypes[2].isInactive);
    assert.strictEqual(component.sessionTypes[2].sessionCount, '2');
    assert.notOk(component.sessionTypes[2].isAssessment);
    assert.strictEqual(component.sessionTypes[2].aamcMethod, aamcMethod1.description);
    assert.strictEqual(component.sessionTypes[2].assessmentOption, '');
    assert.strictEqual(component.sessionTypes[2].calendarColor, 'background-color: #ffffff');
  });

  test('clicking edit fires action', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    this.server.create('session-type', {
      school,
      title: 'first',
      assessment: false,
      calendarColor: '#fff',
    });
    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');

    this.set('sessionTypes', sessionTypeModels);
    this.set('manageSessionType', (sessionTypeId) => {
      assert.strictEqual(parseInt(sessionTypeId, 10), 1);
    });
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{this.manageSessionType}}
    />`);

    await component.sessionTypes[0].manage();
  });

  test('clicking title fires action', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    this.server.create('session-type', {
      school,
      title: 'first',
      assessment: false,
      calendarColor: '#fff',
    });
    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');

    this.set('sessionTypes', sessionTypeModels);
    this.set('manageSessionType', (sessionTypeId) => {
      assert.strictEqual(parseInt(sessionTypeId, 10), 1);
    });
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{this.manageSessionType}}
    />`);

    await component.sessionTypes[0].title.edit();
  });

  test('session types without sessions can be deleted', async function (assert) {
    const school = this.server.create('school');
    this.server.create('session-type', {
      school,
      title: 'unlinked',
      assessment: false,
      active: true,
      calendarColor: '#fff',
    });
    this.server.create('session-type', {
      school,
      title: 'linked',
      active: true,
      assessment: false,
      calendarColor: '#fff',
      sessions: this.server.createList('session', 5),
    });

    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');
    this.set('sessionTypes', sessionTypeModels);
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{(noop)}}
      @canDelete={{true}}
    />`);

    assert.notOk(component.sessionTypes[0].isDeletable);
    assert.ok(component.sessionTypes[1].isDeletable);
  });

  test('delete session type', async function (assert) {
    const school = this.server.create('school');
    this.server.create('session-type', {
      school,
    });

    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');

    this.set('sessionTypes', sessionTypeModels);
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{(noop)}}
      @canDelete={{true}}
    />`);

    assert.strictEqual(this.server.db.sessionTypes.length, 1);
    assert.notOk(component.sessionTypes[0].confirmRemoval.isVisible);
    await component.sessionTypes[0].delete();
    assert.strictEqual(
      component.sessionTypes[0].confirmRemoval.message,
      'Are you sure you want to delete this session type? This action cannot be undone. Yes Cancel'
    );
    await component.sessionTypes[0].confirmRemoval.confirm();
    assert.strictEqual(this.server.db.sessionTypes.length, 0);
  });
});
