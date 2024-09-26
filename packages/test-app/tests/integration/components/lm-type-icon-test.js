import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/lm-type-icon';
import createTypedLearningMaterialProxy from 'ilios-common/utils/create-typed-learning-material-proxy';

module('Integration | Component | lm type icon', function (hooks) {
  setupRenderingTest(hooks);

  test('link', async function (assert) {
    const lm = createTypedLearningMaterialProxy({ link: 'https://iliosproject.org' });
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} />`);
    assert.ok(component.isLink);
    assert.strictEqual(component.title, 'Web Link');
  });

  test('citation', async function (assert) {
    const lm = createTypedLearningMaterialProxy({ citation: 'Lorem Ipsum' });
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} />`);
    assert.ok(component.isCitation);
    assert.strictEqual(component.title, 'Citation');
  });

  test('pdf file', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      absoluteFileUri: '/dev/null',
      mimetype: 'application/pdf',
    });
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
    assert.ok(component.isPdf);
    assert.strictEqual(component.title, 'PDF file');
  });

  test('powerpoint file', async function (assert) {
    assert.expect(10);
    const fixtures = [
      { absoluteFileUri: '/dev/null', mimetype: 'ppt' },
      { absoluteFileUri: '/dev/null', mimetype: 'keynote' },
      { absoluteFileUri: '/dev/null', mimetype: 'pps' },
      { absoluteFileUri: '/dev/null', mimetype: 'pptx' },
      { absoluteFileUri: '/dev/null', mimetype: 'powerpoint' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', createTypedLearningMaterialProxy(fixtures[i]));
      await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
      assert.ok(component.isPowerpoint);
      assert.strictEqual(component.title, 'PowerPoint file');
    }
  });

  test('video file', async function (assert) {
    assert.expect(8);
    const fixtures = [
      { absoluteFileUri: '/dev/null', mimetype: 'video/mp4' },
      { absoluteFileUri: '/dev/null', mimetype: 'video/mpg' },
      { absoluteFileUri: '/dev/null', mimetype: 'video/mpeg' },
      { absoluteFileUri: '/dev/null', mimetype: 'video/mov' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', createTypedLearningMaterialProxy(fixtures[i]));
      await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
      assert.ok(component.isVideo);
      assert.strictEqual(component.title, 'Video file');
    }
  });

  test('audio file', async function (assert) {
    assert.expect(8);
    const fixtures = [
      { absoluteFileUri: '/dev/null', mimetype: 'audio/wav' },
      { absoluteFileUri: '/dev/null', mimetype: 'audio/mp3' },
      { absoluteFileUri: '/dev/null', mimetype: 'audio/aac' },
      { absoluteFileUri: '/dev/null', mimetype: 'audio/flac' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', fixtures[i]);
      await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
      assert.ok(component.isAudio);
      assert.strictEqual(component.title, 'Audio file');
    }
  });

  test('file of unknown mime-type', async function (assert) {
    assert.expect(4);
    const fixtures = [
      { absoluteFileUri: '/dev/null', mimetype: '' },
      { absoluteFileUri: '/dev/null', mimetype: 'xyz' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', fixtures[i].lm);
      await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
      assert.ok(component.isFile);
      assert.strictEqual(component.title, 'File');
    }
  });

  test('listItem', async function (assert) {
    const lm = createTypedLearningMaterialProxy({ link: 'https://iliosproject.org' });
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} @listItem={{true}} />`);
    assert.dom('.list-item').exists();
  });

  test('no listItem', async function (assert) {
    const lm = createTypedLearningMaterialProxy({ link: 'https://iliosproject.org' });
    this.set('lm', lm);

    await render(hbs`<LmTypeIcon @type={{this.lm.type}} />`);
    assert.strictEqual(
      this.element.querySelectorAll('.list-item').length,
      0,
      'List icon class is not applied by default.',
    );

    await render(hbs`<LmTypeIcon @type={{this.lm.type}} @listItem={{false}} />`);
    assert.dom('.list-item').doesNotExist();
  });
});
