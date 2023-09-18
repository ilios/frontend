import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/school';

// @todo flesh out test coverage - the full CRUD, read-only mode, etc [ST 2023/09/18]
module('Acceptance | School - Session Types', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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

    assert.strictEqual(page.manager.schoolSessionTypesExpanded.list.sessionTypes.length, 1);
    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].title.text,
      'one',
    );
    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].sessionCount,
      '0',
    );
    assert.ok(page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].isAssessment);
    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].assessmentOption,
      'summative',
    );
    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].aamcMethod,
      'Celebration',
    );
    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].calendarColor,
      'background-color: #cc0000',
    );

    await page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].manage();
    assert.strictEqual(
      currentURL(),
      '/schools/1?schoolManagedSessionType=1&schoolSessionTypeDetails=true',
    );
    await page.manager.schoolSessionTypesExpanded.manager.form.title.set('lorem ipsum');
    await page.manager.schoolSessionTypesExpanded.manager.form.aamcMethod.select(aamcMethods[1].id);
    await page.manager.schoolSessionTypesExpanded.manager.form.calendarColor.set('#000000');
    await page.manager.schoolSessionTypesExpanded.manager.form.assessmentSelector.select(
      this.formative.id,
    );
    await page.manager.schoolSessionTypesExpanded.manager.form.submit.click();

    assert.strictEqual(currentURL(), '/schools/1?schoolSessionTypeDetails=true');

    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].title.text,
      'lorem ipsum',
    );
    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].sessionCount,
      '0',
    );
    assert.ok(page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].isAssessment);
    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].assessmentOption,
      'formative',
    );
    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].aamcMethod,
      'Lecture',
    );
    assert.strictEqual(
      page.manager.schoolSessionTypesExpanded.list.sessionTypes[0].calendarColor,
      'background-color: #000000',
    );
  });
});
