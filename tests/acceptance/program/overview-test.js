import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/program';

module('Acceptance | Program - Overview', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('non editable fields', async function (assert) {
    this.server.create('program', {
      school: this.school,
    });
    await page.visit({ programId: 1 });
    assert.equal(currentRouteName(), 'program.index');
    assert.equal(page.overview.shortTitle.text, 'Program Title (short): short_0');
    assert.equal(page.overview.duration.text, 'Duration (in Years): 4');
  });

  test('editable fields', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
    });
    await page.visit({ programId: 1 });
    assert.equal(currentRouteName(), 'program.index');
    assert.equal(page.overview.shortTitle.text, 'Program Title (short): short_0');
    assert.equal(page.overview.duration.text, 'Duration (in Years): 4');
  });

  test('change title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
    });
    await page.visit({ programId: 1 });

    assert.equal(page.header.title.text, 'program 0');
    await page.header.title.edit();
    await page.header.title.set('test new title');
    await page.header.title.save();
    assert.equal(page.header.title.text, 'test new title');
  });

  test('change short title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
    });
    await page.visit({ programId: 1 });

    assert.equal(page.overview.shortTitle.text, 'Program Title (short): short_0');
    await page.overview.shortTitle.edit();
    await page.overview.shortTitle.set('newshort');
    await page.overview.shortTitle.save();
    assert.equal(page.overview.shortTitle.text, 'Program Title (short): newshort');
  });

  test('change duration', async function (assert) {
    assert.expect(13);
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
    });
    await page.visit({ programId: 1 });

    assert.equal(page.overview.duration.text, 'Duration (in Years): 4');
    await page.overview.duration.edit();
    assert.equal(page.overview.duration.options.length, 10);
    for (let i = 0; i < 10; i++) {
      assert.equal(page.overview.duration.options[i].text, i + 1);
    }
    await page.overview.duration.set(9);
    await page.overview.duration.save();
    assert.equal(page.overview.duration.text, 'Duration (in Years): 9');
  });

  test('leave duration at 1', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
      duration: 1,
    });
    await page.visit({ programId: 1 });

    assert.equal(page.overview.duration.text, 'Duration (in Years): 1');
    await page.overview.duration.edit();
    await page.overview.duration.save();
    assert.equal(page.overview.duration.text, 'Duration (in Years): 1');
  });
});
