import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('single-event-learningmaterial-list', 'Integration | Component | ilios calendar single event learningmaterial list', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(4);

  this.set('learningMaterials', [
    {title: 'first one', mimetype: 'pdf', url: 'http://firstlink'},
    {title: 'second one', mimetype: 'wav', url: 'http://secondlink'},
  ]);
  this.render(hbs`{{single-event-learningmaterial-list learningMaterials=learningMaterials}}`);

  assert.equal(this.$('li:eq(0)').text().trim().search(/^first one/), 0);
  assert.equal(this.$('li:eq(0) a').attr('href').trim(), 'http://firstlink');

  assert.equal(this.$('li:eq(1)').text().trim().search(/^second one/), 0);
  assert.equal(this.$('li:eq(1) a').attr('href').trim(), 'http://secondlink');
});

test('displays `None` when provided no content', function(assert) {
  assert.expect(1);

  this.set('learningMaterials', []);
  this.render(hbs`{{single-event-learningmaterial-list
    learningMaterials=learningMaterials
    noContentPhrase='None'
  }}`);

  assert.equal(this.$('.no-content').text(), 'None');
});
