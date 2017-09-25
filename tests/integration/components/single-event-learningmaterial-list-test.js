import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('single-event-learningmaterial-list', 'Integration | Component | ilios calendar single event learningmaterial list', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(11);

  this.set('learningMaterials', [
    {title: 'first one', mimetype: 'application/pdf', absoluteFileUri: 'http://firstlink'},
    {title: 'second one', mimetype: 'audio/wav', absoluteFileUri: 'http://secondlink'},
    {title: 'third one', endDate: new Date('2013-03-01T01:10:00'), isBlanked: true}
  ]);
  this.render(hbs`{{single-event-learningmaterial-list learningMaterials=learningMaterials}}`);

  assert.equal(this.$('li:eq(0)').text().trim().search(/^first one/), 0);
  assert.equal(this.$('li:eq(0) i.fa-file-pdf-o').length, 1, 'LM type icon is present.');
  assert.equal(this.$('li:eq(0) a:eq(0)').attr('href').trim(), 'http://firstlink?inline');
  assert.equal(this.$('li:eq(0) a:eq(1)').attr('href').trim(), 'http://firstlink');
  assert.equal(this.$('li:eq(0) a:eq(1) i.fa-download').length, 1);


  assert.equal(this.$('li:eq(1)').text().trim().search(/^second one/), 0);
  assert.equal(this.$('li:eq(1) i.fa-file-audio-o').length, 1, 'LM type icon is present.');
  assert.equal(this.$('li:eq(1) a').attr('href').trim(), 'http://secondlink');

  assert.equal(this.$('li:eq(2)').text().trim().search(/^third one/), 0);
  assert.equal(this.$('li:eq(2) i.fa-clock-o').length, 1, 'LM type icon is present.');
  assert.ok(
    this.$('li:eq(2) .single-event-learningmaterial-item-timing-info').text().includes('Available before 03/01/2013 1:10 AM'),
    'Timed release info is visible'
  );
});

test('displays `None` when provided no content', function(assert) {
  assert.expect(1);

  this.set('learningMaterials', []);
  this.render(hbs`{{single-event-learningmaterial-list
    learningMaterials=learningMaterials
  }}`);

  assert.equal(this.$('.no-content').text(), 'None');
});
