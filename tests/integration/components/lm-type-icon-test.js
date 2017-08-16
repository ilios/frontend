import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('lm-type-icon', 'Integration | Component | lm type icon', {
  integration: true
});

test('link', function(assert) {
  assert.expect(1);
  let lm = { type: 'link' };
  this.set('lm', lm);
  this.render(hbs`{{lm-type-icon type=lm.type}}`);
  assert.equal(this.$('i.fa-link').length, 1, 'Correct type icon is used.');
});

test('citation', function(assert) {
  assert.expect(1);
  let lm = { type: 'citation' };
  this.set('lm', lm);
  this.render(hbs`{{lm-type-icon type=lm.type}}`);
  assert.equal(this.$('i.fa-paragraph').length, 1, 'Correct type icon is used.');
});

test('file', function(assert) {
  assert.expect(15);
  let fixtures = [
    { lm: { type: 'file', mimetype: 'application/pdf' }, icon: 'fa-file-pdf-o' },
    { lm: { type: 'file', mimetype: 'ppt' }, icon: 'fa-file-powerpoint-o' },
    { lm: { type: 'file', mimetype: 'keynote' }, icon: 'fa-file-powerpoint-o' },
    { lm: { type: 'file', mimetype: 'pps' }, icon: 'fa-file-powerpoint-o' },
    { lm: { type: 'file', mimetype: 'ppx' }, icon: 'fa-file-powerpoint-o' },
    { lm: { type: 'file', mimetype: 'video/mp4' }, icon: 'fa-file-movie-o' },
    { lm: { type: 'file', mimetype: 'video/mpg' }, icon: 'fa-file-movie-o' },
    { lm: { type: 'file', mimetype: 'video/mpeg' }, icon: 'fa-file-movie-o' },
    { lm: { type: 'file', mimetype: 'video/mov' }, icon: 'fa-file-movie-o' },
    { lm: { type: 'file', mimetype: 'audio/wav' }, icon: 'fa-file-audio-o' },
    { lm: { type: 'file', mimetype: 'audio/mp3' }, icon: 'fa-file-audio-o' },
    { lm: { type: 'file', mimetype: 'audio/aac' }, icon: 'fa-file-audio-o' },
    { lm: { type: 'file', mimetype: 'audio/flac' }, icon: 'fa-file-audio-o' },
    { lm: { type: 'file', mimetype: '' }, icon: 'fa-file' },
    { lm: { type: 'file', mimetype: 'xyz' }, icon: 'fa-file' },
  ];

  fixtures.forEach(fixture => {
    let lm = fixture.lm;
    this.set('lm', lm);
    this.render(hbs`{{lm-type-icon type=lm.type mimetype=lm.mimetype}}`);
    assert.equal(this.$(`i.${fixture.icon}`).length, 1, 'Correct type icon is used.');
  });
});

test('listItem', function(assert){
  assert.expect(1);
  let lm = { type: 'link' };
  this.set('lm', lm);
  this.render(hbs`{{lm-type-icon type=lm.type listItem=true}}`);
  assert.equal(this.$('i.fa-li').length, 1, 'List icon is applied.');
});

test('no listItem', function(assert) {
  assert.expect(2);
  let lm = { type: 'link' };
  this.set('lm', lm);

  this.render(hbs`{{lm-type-icon type=lm.type}}`);
  assert.equal(this.$('i.fa-li').length, 0, 'List icon class is not applied by default.');

  this.render(hbs`{{lm-type-icon type=lm.type listItem=false}}`);
  assert.equal(this.$('i.fa-li').length, 0, 'List icon class is not applied.');
});
