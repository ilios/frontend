import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios-common';

// @todo flesh this acceptance test out, use page objects [ST 2020/08/14]
module('Acceptance | assign students', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school', { id: 1 });
    this.server.createList('userRole', 5);
    this.server.create('user', { school, roleIds: [4], firstName: 'Clem', lastName: 'Chowder' });
    this.server.create('user', { school, roleIds: [4], displayName: 'Aardvark' });
    await setupAuthentication({ school, administeredSchools: [school] });
    this.server.create('school');
  });

  test('visiting /admin/assignstudents', async function (assert) {
    await visit('/admin/assignstudents');
    assert.strictEqual(await getElementText('.schoolsfilter'), getText('school 0'));
    assert.strictEqual(currentURL(), '/admin/assignstudents');
  });

  test('users are listed in full name by default', async function (assert) {
    await visit('/admin/assignstudents?schoolId=1');
    assert
      .dom('.students .list tbody tr:nth-of-type(1) td:nth-of-type(2) [data-test-fullname]')
      .hasText('Aardvark');
    assert
      .dom('.students .list tbody tr:nth-of-type(1) td:nth-of-type(2) [data-test-info]')
      .exists();
    assert
      .dom('.students .list tbody tr:nth-of-type(2) td:nth-of-type(2) [data-test-fullname]')
      .hasText('Clem M. Chowder');
    assert
      .dom('.students .list tbody tr:nth-of-type(2) td:nth-of-type(2) [data-test-info]')
      .doesNotExist();
  });
});
