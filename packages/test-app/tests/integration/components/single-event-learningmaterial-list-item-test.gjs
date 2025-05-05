import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/single-event-learningmaterial-list-item';
import createTypedLearningMaterialProxy from 'ilios-common/utils/create-typed-learning-material-proxy';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import Service from '@ember/service';
import SingleEventLearningmaterialListItem from 'ilios-common/components/single-event-learningmaterial-list-item';

module('Integration | Component | single-event-learningmaterial-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
  });

  test('blanked', async function (assert) {
    const lm = { title: 'foo bar', isBlanked: true };
    this.set('lm', lm);
    await render(
      <template><SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} /></template>,
    );
    assert.strictEqual(component.title, 'foo bar');
    assert.strictEqual(component.timingInfo.text, '');
    assert.notOk(component.isRequired);
    assert.notOk(component.typeIcon.isPresent);
    assert.notOk(component.pdfLink.isPresent);
    assert.notOk(component.pdfDownloadLink.isPresent);
    assert.notOk(component.fileLink.isPresent);
    assert.notOk(component.filesize.isPresent);
    assert.notOk(component.link.isPresent);
    assert.notOk(component.citation.isPresent);
    assert.notOk(component.publicNotes.isPresent);
  });

  test('blanked and timed release', async function (assert) {
    const now = DateTime.now();
    const startDate = now.minus({ hour: 1 });
    const endDate = now.plus({ hour: 1 });
    const opts = {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      isBlanked: true,
      startDate: startDate.toJSDate(),
      endDate: endDate.toJSDate(),
    });
    this.set('lm', lm);
    await render(
      <template><SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} /></template>,
    );
    assert.strictEqual(component.title, 'foo bar');
    assert.strictEqual(
      component.timingInfo.text,
      `(Available: ${this.intl.formatDate(startDate, opts)} until ${this.intl.formatDate(
        endDate,
        opts,
      )})`,
    );
  });

  test('not blanked and timed release', async function (assert) {
    const now = DateTime.now();
    const startDate = now.minus({ hour: 1 });
    const endDate = now.plus({ hour: 1 });
    const opts = {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      startDate: startDate.toJSDate(),
      endDate: endDate.toJSDate(),
      mimetype: 'application/pdf',
      filesize: 1111,
      absoluteFileUri: '/foo/bar',
    });
    this.set('lm', lm);
    await render(
      <template>
        <SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} @linked={{true}} />
      </template>,
    );
    assert.strictEqual(component.title, 'foo bar (1kb)');
    assert.strictEqual(
      component.timingInfo.text,
      `(Available: ${this.intl.formatDate(startDate, opts)} until ${this.intl.formatDate(
        endDate,
        opts,
      )})`,
    );
    assert.notOk(component.isRequired);
    assert.ok(component.typeIcon.isPresent);
    assert.ok(component.pdfLink.isPresent);
    assert.ok(component.pdfDownloadLink.isPresent);
    assert.notOk(component.fileLink.isPresent);
    assert.ok(component.filesize.isPresent);
    assert.notOk(component.link.isPresent);
    assert.notOk(component.citation.isPresent);
    assert.notOk(component.publicNotes.isPresent);
  });

  test('required', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      required: true,
    });
    this.set('lm', lm);
    await render(
      <template><SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} /></template>,
    );
    assert.ok(component.isRequired);
  });

  test('pdf', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      mimetype: 'application/pdf',
      filesize: 1111,
      absoluteFileUri: '/foo/bar',
    });
    this.set('lm', lm);
    await render(
      <template>
        <SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} @linked={{true}} />
      </template>,
    );
    assert.strictEqual(component.title, 'foo bar (1kb)');
    assert.ok(component.typeIcon.isPdf);
    assert.ok(component.pdfLink.url.endsWith('/foo/bar?inline'));
    assert.ok(component.pdfDownloadLink.url.endsWith('/foo/bar'));
    assert.notOk(component.fileLink.isPresent);
    assert.strictEqual(component.filesize.text, '(1kb)');
    assert.notOk(component.link.isPresent);
    assert.notOk(component.citation.isPresent);
    assert.notOk(component.publicNotes.isPresent);
  });

  test('file', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      mimetype: 'whatever/thisis',
      filesize: 1111,
      absoluteFileUri: '/foo/bar',
    });
    this.set('lm', lm);
    await render(
      <template>
        <SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} @linked={{true}} />
      </template>,
    );
    assert.strictEqual(component.title, 'foo bar (1kb)');
    assert.ok(component.typeIcon.isFile);
    assert.notOk(component.pdfLink.isPresent);
    assert.notOk(component.pdfDownloadLink.isPresent);
    assert.ok(component.fileLink.url.endsWith('/foo/bar'));
    assert.strictEqual(component.filesize.text, '(1kb)');
    assert.notOk(component.link.isPresent);
    assert.notOk(component.citation.isPresent);
    assert.notOk(component.publicNotes.isPresent);
  });

  test('file and not linked', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      mimetype: 'whatever/thisis',
      filesize: 1111,
      absoluteFileUri: '/foo/bar',
    });
    this.set('lm', lm);
    await render(
      <template>
        <SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} @linked={{false}} />
      </template>,
    );
    assert.strictEqual(component.title, 'foo bar (1kb)');
    assert.ok(component.typeIcon.isFile);
    assert.notOk(component.pdfLink.isPresent);
    assert.notOk(component.pdfDownloadLink.isPresent);
    assert.notOk(component.fileLink.isPresent);
    assert.strictEqual(component.filesize.text, '(1kb)');
    assert.notOk(component.link.isPresent);
    assert.notOk(component.citation.isPresent);
    assert.notOk(component.publicNotes.isPresent);
  });

  test('link', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      link: 'https://iliosproject.org/',
    });
    this.set('lm', lm);
    await render(
      <template>
        <SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} @linked={{true}} />
      </template>,
    );
    assert.strictEqual(component.title, 'foo bar');
    assert.ok(component.typeIcon.isLink);
    assert.notOk(component.pdfLink.isPresent);
    assert.notOk(component.pdfDownloadLink.isPresent);
    assert.notOk(component.fileLink.isPresent);
    assert.notOk(component.filesize.isPresent);
    assert.strictEqual(component.link.url, 'https://iliosproject.org/');
    assert.notOk(component.citation.isPresent);
    assert.notOk(component.publicNotes.isPresent);
  });

  test('link and not linked', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      link: 'https://iliosproject.org/',
    });
    this.set('lm', lm);
    await render(
      <template>
        <SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} @linked={{false}} />
      </template>,
    );
    assert.strictEqual(component.title, 'foo bar');
    assert.ok(component.typeIcon.isLink);
    assert.notOk(component.pdfLink.isPresent);
    assert.notOk(component.pdfDownloadLink.isPresent);
    assert.notOk(component.fileLink.isPresent);
    assert.notOk(component.filesize.isPresent);
    assert.notOk(component.link.isPresent);
    assert.notOk(component.citation.isPresent);
    assert.notOk(component.publicNotes.isPresent);
  });

  test('citation', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      citation: 'Lorem Ipsum',
    });
    this.set('lm', lm);
    await render(
      <template><SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} /></template>,
    );
    assert.strictEqual(component.title, 'foo bar');
    assert.ok(component.typeIcon.isCitation);
    assert.notOk(component.pdfLink.isPresent);
    assert.notOk(component.pdfDownloadLink.isPresent);
    assert.notOk(component.fileLink.isPresent);
    assert.notOk(component.filesize.isPresent);
    assert.notOk(component.link.isPresent);
    assert.strictEqual(component.citation.text, 'Lorem Ipsum');
    assert.notOk(component.publicNotes.isPresent);
  });

  test('public notes', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      title: 'foo bar',
      publicNotes: 'read this',
    });
    this.set('lm', lm);
    await render(
      <template><SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} /></template>,
    );
    assert.strictEqual(component.publicNotes.text, 'read this');
  });

  test('user material status enabled', async function (assert) {
    const session = this.server.create('session');
    const sessionLearningMaterial = this.server.create('session-learning-material', {
      session,
    });
    const sessionMaterialStatus = this.server.create('user-session-material-status', {
      material: sessionLearningMaterial,
    });
    const user = this.server.create('user', {
      sessionMaterialStatuses: [sessionMaterialStatus],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const lm = createTypedLearningMaterialProxy({
      sessionLearningMaterial: sessionLearningMaterial.id,
    });
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    class IliosConfigMock extends Service {
      apiNameSpace = '/api';
      async itemFromConfig(name) {
        return name === 'materialStatusEnabled';
      }
    }
    this.owner.register('service:iliosConfig', IliosConfigMock);
    this.owner.register('service:current-user', CurrentUserMock);

    this.set('lm', lm);
    await render(
      <template>
        <SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} @linked={{true}} />
      </template>,
    );
    assert.notOk(component.userMaterialStatus.isDisabled);
  });

  test('user material status disabled', async function (assert) {
    const session = this.server.create('session');
    const sessionLearningMaterial = this.server.create('session-learning-material', {
      session,
    });
    const sessionMaterialStatus = this.server.create('user-session-material-status', {
      material: sessionLearningMaterial,
    });
    const user = this.server.create('user', {
      sessionMaterialStatuses: [sessionMaterialStatus],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    const lm = createTypedLearningMaterialProxy({
      sessionLearningMaterial: sessionLearningMaterial.id,
    });
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    class IliosConfigMock extends Service {
      apiNameSpace = '/api';
      async itemFromConfig(name) {
        return name === 'materialStatusEnabled';
      }
    }
    this.owner.register('service:iliosConfig', IliosConfigMock);
    this.owner.register('service:current-user', CurrentUserMock);

    this.set('lm', lm);
    await render(
      <template>
        <SingleEventLearningmaterialListItem @learningMaterial={{this.lm}} @linked={{false}} />
      </template>,
    );
    assert.ok(component.userMaterialStatus.isDisabled);
  });
});
