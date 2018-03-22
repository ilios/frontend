import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios calendar single event learningmaterial list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(10);

    this.set('learningMaterials', [
      {title: 'first one', mimetype: 'application/pdf', absoluteFileUri: 'http://firstlink'},
      {title: 'second one', mimetype: 'audio/wav', absoluteFileUri: 'http://secondlink'},
      {title: 'third one', endDate: new Date('2013-03-01T01:10:00'), isBlanked: true}
    ]);
    await render(hbs`{{single-event-learningmaterial-list learningMaterials=learningMaterials}}`);


    assert.equal(this.element.querySelector('li:nth-of-type(1)').textContent.trim().search(/^first one/), 0);
    assert.equal(this.element.querySelectorAll('li:nth-of-type(1) i.fa-file-pdf-o').length, 1, 'LM type icon is present.');
    assert.equal(this.element.querySelector('li:nth-of-type(1) a').getAttribute('href').trim(), 'http://firstlink?inline');
    assert.equal(this.element.querySelector('li:nth-of-type(1) a:nth-of-type(1)').getAttribute('href').trim(), 'http://firstlink?inline');
    assert.equal(this.element.querySelectorAll('li:nth-of-type(1) a:nth-of-type(2) i.fa-download').length, 1);

    assert.equal(this.element.querySelector('li:nth-of-type(2)').textContent.trim().search(/^second one/), 0);
    assert.equal(this.element.querySelectorAll('li:nth-of-type(2) i.fa-file-audio-o').length, 1, 'LM type icon is present.');
    assert.equal(this.element.querySelector('li:nth-of-type(2) a').getAttribute('href').trim(), 'http://secondlink');

    assert.equal(this.element.querySelector('li:nth-of-type(3)').textContent.trim().search(/^third one/), 0);
    assert.equal(this.element.querySelectorAll('li:nth-of-type(3) i.fa-clock-o').length, 1, 'LM type icon is present.');
  });

  test('displays `None` when provided no content', async function(assert) {
    assert.expect(1);

    this.set('learningMaterials', []);
    await render(hbs`{{single-event-learningmaterial-list
      learningMaterials=learningMaterials
    }}`);

    assert.equal(this.element.querySelector('.no-content').textContent, 'None');
  });
});
