import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/lm-type-icon';
import createTypedLearningMaterialProxy from 'ilios-common/utils/create-typed-learning-material-proxy';
import LmTypeIcon from 'ilios-common/components/lm-type-icon';

module('Integration | Component | lm type icon', function (hooks) {
  setupRenderingTest(hooks);

  test('link', async function (assert) {
    const lm = createTypedLearningMaterialProxy({ link: 'https://iliosproject.org' });
    this.set('lm', lm);
    await render(<template><LmTypeIcon @type={{this.lm.type}} /></template>);
    assert.ok(component.isLink);
    assert.strictEqual(component.title, 'Web Link');
  });

  test('citation', async function (assert) {
    const lm = createTypedLearningMaterialProxy({ citation: 'Lorem Ipsum' });
    this.set('lm', lm);
    await render(<template><LmTypeIcon @type={{this.lm.type}} /></template>);
    assert.ok(component.isCitation);
    assert.strictEqual(component.title, 'Citation');
  });

  test('pdf file', async function (assert) {
    const lm = createTypedLearningMaterialProxy({
      absoluteFileUri: '/dev/null',
      mimetype: 'application/pdf',
    });
    this.set('lm', lm);
    await render(
      <template><LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} /></template>,
    );
    assert.ok(component.isPdf);
    assert.strictEqual(component.title, 'PDF file');
  });

  test('powerpoint file', async function (assert) {
    const fixtures = [
      { absoluteFileUri: '/dev/null', mimetype: 'ppt' },
      { absoluteFileUri: '/dev/null', mimetype: 'keynote' },
      { absoluteFileUri: '/dev/null', mimetype: 'pps' },
      { absoluteFileUri: '/dev/null', mimetype: 'pptx' },
      { absoluteFileUri: '/dev/null', mimetype: 'powerpoint' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', createTypedLearningMaterialProxy(fixtures[i]));
      await render(
        <template><LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} /></template>,
      );
      assert.ok(component.isPowerpoint);
      assert.strictEqual(component.title, 'PowerPoint file');
    }
  });

  test('video file', async function (assert) {
    const fixtures = [
      { absoluteFileUri: '/dev/null', mimetype: 'video/mp4' },
      { absoluteFileUri: '/dev/null', mimetype: 'video/mpg' },
      { absoluteFileUri: '/dev/null', mimetype: 'video/mpeg' },
      { absoluteFileUri: '/dev/null', mimetype: 'video/mov' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', createTypedLearningMaterialProxy(fixtures[i]));
      await render(
        <template><LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} /></template>,
      );
      assert.ok(component.isVideo);
      assert.strictEqual(component.title, 'Video file');
    }
  });

  test('audio file', async function (assert) {
    const fixtures = [
      { absoluteFileUri: '/dev/null', mimetype: 'audio/wav' },
      { absoluteFileUri: '/dev/null', mimetype: 'audio/mp3' },
      { absoluteFileUri: '/dev/null', mimetype: 'audio/aac' },
      { absoluteFileUri: '/dev/null', mimetype: 'audio/flac' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', fixtures[i]);
      await render(
        <template><LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} /></template>,
      );
      assert.ok(component.isAudio);
      assert.strictEqual(component.title, 'Audio file');
    }
  });

  test('file of unknown mime-type', async function (assert) {
    const fixtures = [
      { absoluteFileUri: '/dev/null', mimetype: '' },
      { absoluteFileUri: '/dev/null', mimetype: 'xyz' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', fixtures[i].lm);
      await render(
        <template><LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} /></template>,
      );
      assert.ok(component.isFile);
      assert.strictEqual(component.title, 'File');
    }
  });

  test('listItem', async function (assert) {
    const lm = createTypedLearningMaterialProxy({ link: 'https://iliosproject.org' });
    this.set('lm', lm);
    await render(<template><LmTypeIcon @type={{this.lm.type}} @listItem={{true}} /></template>);
    assert.dom('.fa-li').exists();
  });

  test('no listItem', async function (assert) {
    const lm = createTypedLearningMaterialProxy({ link: 'https://iliosproject.org' });
    this.set('lm', lm);

    await render(<template><LmTypeIcon @type={{this.lm.type}} /></template>);
    assert.strictEqual(
      this.element.querySelectorAll('.list-item').length,
      0,
      'List icon class is not applied by default.',
    );

    await render(<template><LmTypeIcon @type={{this.lm.type}} @listItem={{false}} /></template>);
    assert.dom('.list-item').doesNotExist();
  });
});
