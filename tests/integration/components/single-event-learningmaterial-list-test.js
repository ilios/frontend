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


    assert.ok(this.element.querySelector('li:nth-of-type(1)').textContent.includes('first one'));
    assert.equal(this.element.querySelectorAll('li:nth-of-type(1) .fa-file-pdf').length, 1, 'LM type icon is present.');
    assert.equal(this.element.querySelector('li:nth-of-type(1) a').getAttribute('href').trim(), 'http://firstlink?inline');
    assert.equal(this.element.querySelector('li:nth-of-type(1) a:nth-of-type(1)').getAttribute('href').trim(), 'http://firstlink?inline');
    assert.equal(this.element.querySelectorAll('li:nth-of-type(1) a:nth-of-type(2) .fa-download').length, 1);

    assert.ok(this.element.querySelector('li:nth-of-type(2)').textContent.includes('second one'));
    assert.equal(this.element.querySelectorAll('li:nth-of-type(2) .fa-file-audio').length, 1, 'LM type icon is present.');
    assert.equal(this.element.querySelector('li:nth-of-type(2) a').getAttribute('href').trim(), 'http://secondlink');

    assert.ok(this.element.querySelector('li:nth-of-type(3)').textContent.includes('third one'));
    assert.equal(this.element.querySelectorAll('li:nth-of-type(3) .fa-clock').length, 1, 'LM type icon is present.');
  });

  test('displays `None` when provided no content', async function(assert) {
    assert.expect(1);

    this.set('learningMaterials', []);
    await render(hbs`{{single-event-learningmaterial-list
      learningMaterials=learningMaterials
    }}`);

    assert.dom(this.element.querySelector('.no-content')).hasText('None');
  });
});
