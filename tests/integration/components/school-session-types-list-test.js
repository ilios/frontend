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

  hooks.beforeEach(async function () {
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

    this.sessionTypes = await this.owner.lookup('service:store').findAll('session-type');
  });

  test('it renders', async function (assert) {
    this.set('sessionTypes', this.sessionTypes);
    await render(
      hbs`<SchoolSessionTypesList @sessionTypes={{this.sessionTypes}} @manageSessionType={{(noop)}} />`
    );

    assert.strictEqual(component.sessionTypes.length, 3);
    assert.strictEqual(component.sessionTypes[0].title.text, 'first');
    assert.ok(component.sessionTypes[0].isActive);
    assert.strictEqual(component.sessionTypes[0].sessionCount, '2');
    assert.notOk(component.sessionTypes[0].isAssessment);
    assert.strictEqual(component.sessionTypes[0].aamcMethod, 'Lorem Ipsum');
    assert.strictEqual(component.sessionTypes[0].assessmentOption, '');
    assert.strictEqual(component.sessionTypes[0].calendarColor, 'background-color: #cccccc');
    assert.strictEqual(component.sessionTypes[1].title.text, 'second');
    assert.ok(component.sessionTypes[1].isActive);
    assert.strictEqual(component.sessionTypes[1].sessionCount, '0');
    assert.ok(component.sessionTypes[1].isAssessment);
    assert.strictEqual(component.sessionTypes[1].aamcMethod, 'Dolor Et');
    assert.strictEqual(component.sessionTypes[1].assessmentOption, 'formative');
    assert.strictEqual(component.sessionTypes[1].calendarColor, 'background-color: #123456');
    assert.strictEqual(component.sessionTypes[2].title.text, 'not needed anymore');
    assert.ok(component.sessionTypes[2].isInactive);
    assert.strictEqual(component.sessionTypes[2].sessionCount, '2');
    assert.notOk(component.sessionTypes[2].isAssessment);
    assert.strictEqual(component.sessionTypes[2].aamcMethod, 'Lorem Ipsum');
    assert.strictEqual(component.sessionTypes[2].assessmentOption, '');
    assert.strictEqual(component.sessionTypes[2].calendarColor, 'background-color: #ffffff');
  });

  test('clicking edit fires action', async function (assert) {
    assert.expect(1);
    this.set('sessionTypes', this.sessionTypes);
    this.set('manageSessionType', (sessionTypeId) => {
      assert.strictEqual(parseInt(sessionTypeId, 10), 3);
    });
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{this.manageSessionType}}
    />`);

    await component.sessionTypes[0].manage();
  });

  test('clicking title fires action', async function (assert) {
    assert.expect(1);
    this.set('sessionTypes', this.sessionTypes);
    this.set('manageSessionType', (sessionTypeId) => {
      assert.strictEqual(parseInt(sessionTypeId, 10), 3);
    });
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{this.manageSessionType}}
    />`);

    await component.sessionTypes[0].title.edit();
  });

  test('session types without sessions can be deleted', async function (assert) {
    this.set('sessionTypes', this.sessionTypes);
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{(noop)}}
      @canDelete={{true}}
    />`);

    assert.notOk(component.sessionTypes[0].isDeletable);
    assert.ok(component.sessionTypes[1].isDeletable);
    assert.notOk(component.sessionTypes[2].isDeletable);
  });

  test('delete session type', async function (assert) {
    this.set('sessionTypes', this.sessionTypes);
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{(noop)}}
      @canDelete={{true}}
    />`);
    assert.strictEqual(this.server.db.sessionTypes.length, 3);
    assert.notOk(component.sessionTypes[1].confirmRemoval.isVisible);
    await component.sessionTypes[1].delete();
    assert.strictEqual(
      component.sessionTypes[1].confirmRemoval.message,
      'Are you sure you want to delete this session type? This action cannot be undone. Yes Cancel'
    );
    await component.sessionTypes[1].confirmRemoval.confirm();
    assert.strictEqual(this.server.db.sessionTypes.length, 2);
  });

  test('sort', async function (assert) {
    this.set('sessionTypes', this.sessionTypes);
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{(noop)}}
      @canDelete={{true}}
    />`);

    // default sort order is sorted by active, descending
    assert.ok(component.isSortedByActiveStatusDescending);
    assert.ok(component.sessionTypes[0].isActive);
    assert.ok(component.sessionTypes[1].isActive);
    assert.notOk(component.sessionTypes[2].isActive);

    await component.sortByActiveStatus();
    assert.ok(component.isSortedByActiveStatusAscending);
    assert.notOk(component.sessionTypes[0].isActive);
    assert.ok(component.sessionTypes[1].isActive);
    assert.ok(component.sessionTypes[2].isActive);

    await component.sortByTitle();
    assert.ok(component.isSortedByTitleAscending);
    assert.strictEqual(component.sessionTypes[0].title.text, 'first');
    assert.strictEqual(component.sessionTypes[1].title.text, 'not needed anymore');
    assert.strictEqual(component.sessionTypes[2].title.text, 'second');

    await component.sortByTitle();
    assert.ok(component.isSortedByTitleDescending);
    assert.strictEqual(component.sessionTypes[0].title.text, 'second');
    assert.strictEqual(component.sessionTypes[1].title.text, 'not needed anymore');
    assert.strictEqual(component.sessionTypes[2].title.text, 'first');

    await component.sortBySessions();
    assert.ok(component.isSortedBySessionsAscending);
    assert.strictEqual(component.sessionTypes[0].sessionCount, '0');
    assert.strictEqual(component.sessionTypes[1].sessionCount, '2');
    assert.strictEqual(component.sessionTypes[2].sessionCount, '2');

    await component.sortBySessions();
    assert.ok(component.isSortedBySessionsDescending);
    assert.strictEqual(component.sessionTypes[0].sessionCount, '2');
    assert.strictEqual(component.sessionTypes[1].sessionCount, '2');
    assert.strictEqual(component.sessionTypes[2].sessionCount, '0');

    await component.sortByAssessment();
    assert.ok(component.isSortedByAssessmentAscending);
    assert.notOk(component.sessionTypes[0].isAssessment);
    assert.notOk(component.sessionTypes[1].isAssessment);
    assert.ok(component.sessionTypes[2].isAssessment);

    await component.sortByAssessment();
    assert.ok(component.isSortedByAssessmentDescending);
    assert.ok(component.sessionTypes[0].isAssessment);
    assert.notOk(component.sessionTypes[1].isAssessment);
    assert.notOk(component.sessionTypes[2].isAssessment);

    await component.sortByAssessmentOption();
    assert.ok(component.isSortedByAssessmentOptionAscending);
    assert.strictEqual(component.sessionTypes[0].assessmentOption, '');
    assert.strictEqual(component.sessionTypes[1].assessmentOption, '');
    assert.strictEqual(component.sessionTypes[2].assessmentOption, 'formative');

    await component.sortByAssessmentOption();
    assert.ok(component.isSortedByAssessmentOptionDescending);
    assert.strictEqual(component.sessionTypes[0].assessmentOption, 'formative');
    assert.strictEqual(component.sessionTypes[1].assessmentOption, '');
    assert.strictEqual(component.sessionTypes[2].assessmentOption, '');

    await component.sortByColor();
    assert.ok(component.isSortedByColorAscending);
    assert.strictEqual(component.sessionTypes[0].calendarColor, 'background-color: #123456');
    assert.strictEqual(component.sessionTypes[1].calendarColor, 'background-color: #cccccc');
    assert.strictEqual(component.sessionTypes[2].calendarColor, 'background-color: #ffffff');

    await component.sortByColor();
    assert.ok(component.isSortedByColorDescending);
    assert.strictEqual(component.sessionTypes[0].calendarColor, 'background-color: #ffffff');
    assert.strictEqual(component.sessionTypes[1].calendarColor, 'background-color: #cccccc');
    assert.strictEqual(component.sessionTypes[2].calendarColor, 'background-color: #123456');
  });
});
