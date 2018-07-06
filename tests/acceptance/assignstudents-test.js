import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { percySnapshot } from 'ember-percy';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

module('Acceptance: assign students', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school, administeredSchools: [this.school] });
    this.server.create('school');
  });

  test('visiting /admin/assignstudents', async function(assert) {
    await visit('/admin/assignstudents');

    assert.equal(await getElementText('.schoolsfilter'), getText('school 0'));

    assert.equal(currentURL(), '/admin/assignstudents');
    percySnapshot(assert);
  });
});
