import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
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
    assert.strictEqual(currentRouteName(), 'program.index');
    assert.strictEqual(page.root.overview.shortTitle.text, 'Program Title (short): short_0');
    assert.strictEqual(page.root.overview.duration.text, 'Duration (in Years): 4');
  });

  test('editable fields', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
    });
    await page.visit({ programId: 1 });
    assert.strictEqual(currentRouteName(), 'program.index');
    assert.strictEqual(page.root.overview.shortTitle.text, 'Program Title (short): short_0');
    assert.strictEqual(page.root.overview.duration.text, 'Duration (in Years): 4');
  });

  test('change title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
    });
    await page.visit({ programId: 1 });

    assert.strictEqual(page.root.header.title.text, 'program 0');
    await page.root.header.title.edit();
    await page.root.header.title.set('test new title');
    await page.root.header.title.save();
    assert.strictEqual(page.root.header.title.text, 'test new title');
  });

  test('change short title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
    });
    await page.visit({ programId: 1 });

    assert.strictEqual(page.root.overview.shortTitle.text, 'Program Title (short): short_0');
    await page.root.overview.shortTitle.edit();
    await page.root.overview.shortTitle.set('newshort');
    await page.root.overview.shortTitle.save();
    assert.strictEqual(page.root.overview.shortTitle.text, 'Program Title (short): newshort');
  });

  test('change duration', async function (assert) {
    assert.expect(13);
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
    });
    await page.visit({ programId: 1 });

    assert.strictEqual(page.root.overview.duration.text, 'Duration (in Years): 4');
    await page.root.overview.duration.edit();
    assert.strictEqual(page.root.overview.duration.options.length, 10);
    for (let i = 0; i < 10; i++) {
      assert.strictEqual(parseInt(page.root.overview.duration.options[i].text), i + 1);
    }
    await page.root.overview.duration.set(9);
    await page.root.overview.duration.save();
    assert.strictEqual(page.root.overview.duration.text, 'Duration (in Years): 9');
  });

  test('leave duration at 1', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      school: this.school,
      duration: 1,
    });
    await page.visit({ programId: 1 });

    assert.strictEqual(page.root.overview.duration.text, 'Duration (in Years): 1');
    await page.root.overview.duration.edit();
    await page.root.overview.duration.save();
    assert.strictEqual(page.root.overview.duration.text, 'Duration (in Years): 1');
  });
});
