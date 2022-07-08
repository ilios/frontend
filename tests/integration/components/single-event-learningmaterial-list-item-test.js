import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/single-event-learningmaterial-list-item';

module('Integration | Component | single-event-learningmaterial-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('blanked', async function (assert) {
    const lm = { title: 'foo bar', isBlanked: true };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
    />`);
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
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    const lm = {
      title: 'foo bar',
      isBlanked: true,
      startDate: startDate.toJSDate(),
      endDate: endDate.toJSDate(),
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
    />`);
    assert.strictEqual(component.title, 'foo bar');
    assert.strictEqual(
      component.timingInfo.text,
      `(Available: ${startDate.toLocaleString(opts)} and available until ${endDate.toLocaleString(
        opts
      )})`
    );
  });

  test('not blanked and timed release', async function (assert) {
    const now = DateTime.now();
    const startDate = now.minus({ hour: 1 });
    const endDate = now.plus({ hour: 1 });
    const opts = {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    const lm = {
      title: 'foo bar',
      startDate: startDate.toJSDate(),
      endDate: endDate.toJSDate(),
      mimetype: 'application/pdf',
      filesize: 1111,
      absoluteFileUri: '/foo/bar',
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
      @linked={{true}}
    />`);
    assert.strictEqual(component.title, 'foo bar (1kb)');
    assert.strictEqual(
      component.timingInfo.text,
      `(Available: ${startDate.toLocaleString(opts)} and available until ${endDate.toLocaleString(
        opts
      )})`
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
    const lm = {
      title: 'foo bar',
      required: true,
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
    />`);
    assert.ok(component.isRequired);
  });

  test('pdf', async function (assert) {
    const lm = {
      title: 'foo bar',
      mimetype: 'application/pdf',
      filesize: 1111,
      absoluteFileUri: '/foo/bar',
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
      @linked={{true}}
    />`);
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
    const lm = {
      title: 'foo bar',
      mimetype: 'whatever/thisis',
      filesize: 1111,
      absoluteFileUri: '/foo/bar',
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
      @linked={{true}}
    />`);
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
    const lm = {
      title: 'foo bar',
      mimetype: 'whatever/thisis',
      filesize: 1111,
      absoluteFileUri: '/foo/bar',
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
      @linked={{false}}
    />`);
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
    const lm = {
      title: 'foo bar',
      type: 'link',
      link: 'https://iliosproject.org/',
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
      @linked={{true}}
    />`);
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
    const lm = {
      title: 'foo bar',
      type: 'link',
      link: 'https://iliosproject.org/',
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
      @linked={{false}}
    />`);
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
    const lm = {
      title: 'foo bar',
      type: 'citation',
      citation: 'Lorem Ipsum',
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
    />`);
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
    const lm = {
      title: 'foo bar',
      publicNotes: 'read this',
    };
    this.set('lm', lm);
    await render(hbs`<SingleEventLearningmaterialListItem
      @learningMaterial={{this.lm}}
    />`);
    assert.strictEqual(component.publicNotes.text, 'read this');
  });
});
