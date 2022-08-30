import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/lm-type-icon';

module('Integration | Component | lm type icon', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('link', async function (assert) {
    const lm = { type: 'link' };
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} />`);
    assert.ok(component.isLink);
  });

  test('citation', async function (assert) {
    const lm = { type: 'citation' };
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} />`);
    assert.ok(component.isCitation);
  });

  test('pdf file', async function (assert) {
    const lm = { type: 'file', mimetype: 'application/pdf' };
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
    assert.ok(component.isPdf);
  });

  test('powerpoint file', async function (assert) {
    assert.expect(5);
    const fixtures = [
      { type: 'file', mimetype: 'ppt' },
      { type: 'file', mimetype: 'keynote' },
      { type: 'file', mimetype: 'pps' },
      { type: 'file', mimetype: 'pptx' },
      { type: 'file', mimetype: 'powerpoint' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', fixtures[i]);
      await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
      assert.ok(component.isPowerpoint);
    }
  });

  test('video file', async function (assert) {
    assert.expect(4);
    const fixtures = [
      { type: 'file', mimetype: 'video/mp4' },
      { type: 'file', mimetype: 'video/mpg' },
      { type: 'file', mimetype: 'video/mpeg' },
      { type: 'file', mimetype: 'video/mov' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', fixtures[i]);
      await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
      assert.ok(component.isVideo);
    }
  });

  test('audio file', async function (assert) {
    assert.expect(4);
    const fixtures = [
      { type: 'file', mimetype: 'audio/wav' },
      { type: 'file', mimetype: 'audio/mp3' },
      { type: 'file', mimetype: 'audio/aac' },
      { type: 'file', mimetype: 'audio/flac' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', fixtures[i]);
      await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
      assert.ok(component.isAudio);
    }
  });

  test('file of unknown mime-type', async function (assert) {
    assert.expect(2);
    const fixtures = [
      { type: 'file', mimetype: '' },
      { type: 'file', mimetype: 'xyz' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', fixtures[i].lm);
      await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
      assert.ok(component.isFile);
    }
  });

  test('listItem', async function (assert) {
    const lm = { type: 'link' };
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} @listItem={{true}} />`);
    assert.dom('.fa-li').exists();
  });

  test('no listItem', async function (assert) {
    assert.expect(2);
    const lm = { type: 'link' };
    this.set('lm', lm);

    await render(hbs`<LmTypeIcon @type={{this.lm.type}} />`);
    assert.strictEqual(
      this.element.querySelectorAll('.fa-li').length,
      0,
      'List icon class is not applied by default.'
    );

    await render(hbs`<LmTypeIcon @type={{this.lm.type}} @listItem={{false}} />`);
    assert.dom('.fa-li').doesNotExist();
  });
});
