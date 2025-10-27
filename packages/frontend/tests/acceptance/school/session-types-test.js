import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { currentURL } from '@ember/test-helpers';
import page from 'frontend/tests/pages/school';

// @todo flesh out test coverage - the full CRUD, read-only mode, etc [ST 2023/09/18]
module('Acceptance | School - Session Types', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.school = school;
    this.formative = this.server.create('assessment-option', {
      name: 'formative',
    });
    this.summative = this.server.create('assessment-option', {
      name: 'summative',
    });
    await setupAuthentication({ school, administeredSchools: [school] }, true);
  });

  test('update session type', async function (assert) {
    const aamcMethods = [
      this.server.create('aamc-method', { id: 'AM001', description: 'Celebration', active: true }),
      this.server.create('aamc-method', { id: 'AM002', description: 'Lecture', active: true }),
    ];
    this.server.create('session-type', {
      title: 'one',
      calendarColor: '#cc0000',
      assessment: true,
      assessmentOption: this.summative,
      aamcMethods: [aamcMethods[0]],
      school: this.school,
    });

    await page.visit({ schoolId: this.school.id });
    assert.strictEqual(currentURL(), '/schools/1');

    await page.manager.schoolSessionTypesCollapsed.expand();
    assert.strictEqual(currentURL(), '/schools/1?schoolSessionTypeDetails=true');

    const { schoolSessionTypesExpanded: e } = page.manager;

    assert.strictEqual(e.list.sessionTypes.length, 1);
    assert.strictEqual(e.list.sessionTypes[0].title.text, 'one');
    assert.strictEqual(e.list.sessionTypes[0].sessionCount, '0');
    assert.ok(e.list.sessionTypes[0].isAssessment);
    assert.strictEqual(e.list.sessionTypes[0].assessmentOption, 'summative');
    assert.strictEqual(e.list.sessionTypes[0].aamcMethod, 'Celebration');
    assert.strictEqual(e.list.sessionTypes[0].calendarColor, 'background-color: #cc0000');

    await e.list.sessionTypes[0].manage();
    assert.strictEqual(
      currentURL(),
      '/schools/1?schoolManagedSessionType=1&schoolSessionTypeDetails=true',
    );
    await e.manager.form.title.set('lorem ipsum');
    await e.manager.form.aamcMethod.select(aamcMethods[1].id);
    await e.manager.form.calendarColor.set('#000000');
    await e.manager.form.assessmentSelector.select(this.formative.id);
    await e.manager.form.submit.click();

    assert.strictEqual(currentURL(), '/schools/1?schoolSessionTypeDetails=true');

    assert.strictEqual(e.list.sessionTypes[0].title.text, 'lorem ipsum');
    assert.strictEqual(e.list.sessionTypes[0].sessionCount, '0');
    assert.ok(e.list.sessionTypes[0].isAssessment);
    assert.strictEqual(e.list.sessionTypes[0].assessmentOption, 'formative');
    assert.strictEqual(e.list.sessionTypes[0].aamcMethod, 'Lecture');
    assert.strictEqual(e.list.sessionTypes[0].calendarColor, 'background-color: #000000');
  });

  test('save session type without changes', async function (assert) {
    const aamcMethods = [
      this.server.create('aamc-method', { id: 'AM001', description: 'Celebration', active: true }),
      this.server.create('aamc-method', { id: 'AM002', description: 'Lecture', active: true }),
    ];
    this.server.create('session-type', {
      title: 'one',
      calendarColor: '#cc0000',
      assessment: true,
      assessmentOption: this.summative,
      aamcMethods: [aamcMethods[0]],
      school: this.school,
    });

    await page.visit({ schoolId: this.school.id });
    await page.manager.schoolSessionTypesCollapsed.expand();
    const { schoolSessionTypesExpanded: e } = page.manager;
    await e.list.sessionTypes[0].manage();
    await e.manager.form.submit.click();

    assert.strictEqual(currentURL(), '/schools/1?schoolSessionTypeDetails=true');
    assert.strictEqual(e.list.sessionTypes.length, 1);
    assert.strictEqual(e.list.sessionTypes[0].title.text, 'one');
    assert.strictEqual(e.list.sessionTypes[0].sessionCount, '0');
    assert.ok(e.list.sessionTypes[0].isAssessment);
    assert.strictEqual(e.list.sessionTypes[0].assessmentOption, 'summative');
    assert.strictEqual(e.list.sessionTypes[0].aamcMethod, 'Celebration');
    assert.strictEqual(e.list.sessionTypes[0].calendarColor, 'background-color: #cc0000');
  });

  test('new session type', async function (assert) {
    this.server.create('aamc-method', { id: 'IM001', active: true });
    this.server.create('aamc-method', { id: 'IM002', active: true });
    this.server.create('aamc-method', { id: 'AM001', active: true });
    this.server.create('aamc-method', { id: 'AM002', active: true });
    await page.visit({ schoolId: this.school.id, schoolSessionTypeDetails: true });
    const { schoolSessionTypesExpanded: e } = page.manager;

    assert.strictEqual(e.list.sessionTypes.length, 0);
    await e.createNew();
    assert.deepEqual(e.newSessionType.aamcMethod.options.length, 3);
    await e.newSessionType.title.set('lorem ipsum');
    await e.newSessionType.aamcMethod.select('IM002');
    await e.newSessionType.calendarColor.set('#cc6699');
    await e.newSessionType.submit.click();
    assert.strictEqual(currentURL(), '/schools/1?schoolSessionTypeDetails=true');

    assert.strictEqual(e.list.sessionTypes[0].title.text, 'lorem ipsum');
    assert.strictEqual(e.list.sessionTypes[0].sessionCount, '0');
    assert.notOk(e.list.sessionTypes[0].isAssessment);
    assert.strictEqual(e.list.sessionTypes[0].aamcMethod, 'aamc method 1');
    assert.strictEqual(e.list.sessionTypes[0].calendarColor, 'background-color: #cc6699');
    assert.strictEqual(e.savedResult, 'lorem ipsum saved successfully');
  });

  test('new session type - assessment', async function (assert) {
    this.server.create('aamc-method', { id: 'IM001', active: true });
    this.server.create('aamc-method', { id: 'IM002', active: true });
    this.server.create('aamc-method', { id: 'AM001', active: true });
    this.server.create('aamc-method', { id: 'AM002', active: true });
    await page.visit({ schoolId: this.school.id, schoolSessionTypeDetails: true });
    const { schoolSessionTypesExpanded: e } = page.manager;

    assert.strictEqual(e.list.sessionTypes.length, 0);
    await e.createNew();
    assert.deepEqual(e.newSessionType.aamcMethod.options.length, 3);
    await e.newSessionType.title.set('lorem ipsum');
    await e.newSessionType.assessment.yesNoToggle.handle.click();
    await e.newSessionType.aamcMethod.select('AM002');
    await e.newSessionType.calendarColor.set('#ccff00');
    await e.newSessionType.assessmentSelector.select(this.summative.id);
    await e.newSessionType.submit.click();
    assert.strictEqual(currentURL(), '/schools/1?schoolSessionTypeDetails=true');

    assert.strictEqual(e.list.sessionTypes[0].title.text, 'lorem ipsum');
    assert.strictEqual(e.list.sessionTypes[0].sessionCount, '0');
    assert.ok(e.list.sessionTypes[0].isAssessment);
    assert.strictEqual(e.list.sessionTypes[0].assessmentOption, 'summative');
    assert.strictEqual(e.list.sessionTypes[0].aamcMethod, 'aamc method 3');
    assert.strictEqual(e.list.sessionTypes[0].calendarColor, 'background-color: #ccff00');
    assert.strictEqual(e.savedResult, 'lorem ipsum saved successfully');
  });
});
