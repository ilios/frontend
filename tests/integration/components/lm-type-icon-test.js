import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | lm type icon', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('link', async function (assert) {
    assert.expect(1);
    const lm = { type: 'link' };
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} />`);
    assert.dom('.fa-link').exists();
  });

  test('citation', async function (assert) {
    assert.expect(1);
    const lm = { type: 'citation' };
    this.set('lm', lm);
    await render(hbs`<LmTypeIcon @type={{this.lm.type}} />`);
    assert.dom('.fa-paragraph').exists();
  });

  test('file', async function (assert) {
    assert.expect(16);
    const fixtures = [
      {
        lm: { type: 'file', mimetype: 'application/pdf' },
        icon: 'fa-file-pdf',
      },
      { lm: { type: 'file', mimetype: 'ppt' }, icon: 'fa-file-powerpoint' },
      { lm: { type: 'file', mimetype: 'keynote' }, icon: 'fa-file-powerpoint' },
      { lm: { type: 'file', mimetype: 'pps' }, icon: 'fa-file-powerpoint' },
      { lm: { type: 'file', mimetype: 'pptx' }, icon: 'fa-file-powerpoint' },
      {
        lm: { type: 'file', mimetype: 'powerpoint' },
        icon: 'fa-file-powerpoint',
      },
      { lm: { type: 'file', mimetype: 'video/mp4' }, icon: 'fa-file-video' },
      { lm: { type: 'file', mimetype: 'video/mpg' }, icon: 'fa-file-video' },
      { lm: { type: 'file', mimetype: 'video/mpeg' }, icon: 'fa-file-video' },
      { lm: { type: 'file', mimetype: 'video/mov' }, icon: 'fa-file-video' },
      { lm: { type: 'file', mimetype: 'audio/wav' }, icon: 'fa-file-audio' },
      { lm: { type: 'file', mimetype: 'audio/mp3' }, icon: 'fa-file-audio' },
      { lm: { type: 'file', mimetype: 'audio/aac' }, icon: 'fa-file-audio' },
      { lm: { type: 'file', mimetype: 'audio/flac' }, icon: 'fa-file-audio' },
      { lm: { type: 'file', mimetype: '' }, icon: 'fa-file' },
      { lm: { type: 'file', mimetype: 'xyz' }, icon: 'fa-file' },
    ];

    for (let i = 0; i < fixtures.length; i++) {
      this.set('lm', fixtures[i].lm);
      await render(hbs`<LmTypeIcon @type={{this.lm.type}} @mimetype={{this.lm.mimetype}} />`);
      assert.dom(`.${fixtures[i].icon}`).exists();
    }
  });

  test('listItem', async function (assert) {
    assert.expect(1);
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
