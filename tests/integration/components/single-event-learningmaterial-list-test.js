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
    await render(hbs`<SingleEventLearningmaterialList @learningMaterials={{learningMaterials}} />`);

    assert.dom('li:nth-of-type(1) .single-event-learningmaterial-item-title').hasText('first one Download');
    assert.dom('li:nth-of-type(1) .fa-file-pdf').exists('LM type icon is present.');
    assert.dom('li:nth-of-type(1) a').hasAttribute('href', 'http://firstlink?inline');
    assert.dom('li:nth-of-type(1) a:nth-of-type(1)').hasAttribute('href', 'http://firstlink?inline');
    assert.dom('li:nth-of-type(1) a:nth-of-type(2) .fa-download').exists();
    assert.dom('li:nth-of-type(2) .single-event-learningmaterial-item-title').hasText('second one');
    assert.dom('li:nth-of-type(2) .fa-file-audio').exists('LM type icon is present.');
    assert.dom('li:nth-of-type(2) a').hasAttribute('href','http://secondlink');
    assert.dom('li:nth-of-type(3) .single-event-learningmaterial-item-title').hasText('third one');
    assert.dom('li:nth-of-type(3) .fa-clock').exists('LM type icon is present.');
  });

  test('displays `None` when provided no content', async function(assert) {
    assert.expect(1);

    this.set('learningMaterials', []);
    await render(hbs`<SingleEventLearningmaterialList @learningMaterials={{learningMaterials}} />`);

    assert.dom('.no-content').hasText('None');
  });
});
