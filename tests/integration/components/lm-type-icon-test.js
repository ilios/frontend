import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | lm type icon', function(hooks) {
  setupRenderingTest(hooks);

  test('link', async function(assert) {
    assert.expect(1);
    let lm = { type: 'link' };
    this.set('lm', lm);
    await render(hbs`{{lm-type-icon type=lm.type}}`);
    assert.equal(this.element.querySelectorAll('.fa-link').length, 1, 'Correct type icon is used.');
  });

  test('citation', async function(assert) {
    assert.expect(1);
    let lm = { type: 'citation' };
    this.set('lm', lm);
    await render(hbs`{{lm-type-icon type=lm.type}}`);
    assert.equal(this.element.querySelectorAll('.fa-paragraph').length, 1, 'Correct type icon is used.');
  });

  test('file', async function(assert) {
    assert.expect(16);
    let fixtures = [
      { lm: { type: 'file', mimetype: 'application/pdf' }, icon: 'fa-file-pdf' },
      { lm: { type: 'file', mimetype: 'ppt' }, icon: 'fa-file-powerpoint' },
      { lm: { type: 'file', mimetype: 'keynote' }, icon: 'fa-file-powerpoint' },
      { lm: { type: 'file', mimetype: 'pps' }, icon: 'fa-file-powerpoint' },
      { lm: { type: 'file', mimetype: 'pptx' }, icon: 'fa-file-powerpoint' },
      { lm: { type: 'file', mimetype: 'powerpoint' }, icon: 'fa-file-powerpoint' },
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
      let lm = fixtures[i].lm;
      let icon = fixtures[i].icon;
      this.set('lm', lm);
      await render(hbs`{{lm-type-icon type=lm.type mimetype=lm.mimetype}}`);
      assert.equal(this.$(`.${icon}`).length, 1, `Correct type icon is used for ${lm.mimetype}`);
    }
  });

  test('listItem', async function(assert) {
    assert.expect(1);
    let lm = { type: 'link' };
    this.set('lm', lm);
    await render(hbs`{{lm-type-icon type=lm.type listItem=true}}`);
    assert.equal(this.element.querySelectorAll('.fa-li').length, 1, 'List icon is applied.');
  });

  test('no listItem', async function(assert) {
    assert.expect(2);
    let lm = { type: 'link' };
    this.set('lm', lm);

    await render(hbs`{{lm-type-icon type=lm.type}}`);
    assert.equal(this.element.querySelectorAll('.fa-li').length, 0, 'List icon class is not applied by default.');

    await render(hbs`{{lm-type-icon type=lm.type listItem=false}}`);
    assert.equal(this.element.querySelectorAll('.fa-li').length, 0, 'List icon class is not applied.');
  });
});
