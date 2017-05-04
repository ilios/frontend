import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import startMirage from '../../helpers/start-mirage';

const { Object:EmberObject } = Ember;

moduleForComponent('collapsed-objectives', 'Integration | Component | collapsed objectives', {
  integration: true,
  setup(){
    startMirage(this.container);
  }
});

test('displays summary data', function(assert) {
  assert.expect(9);
  let hasMesh = server.create('objective', {
    hasMesh: true
  });
  let hasParents = server.create('objective', {
    hasParents: true
  });
  let plain = server.create('objective');
  let objectives = [hasMesh, hasParents, plain].map(obj => Ember.Object.create(obj));

  const course = EmberObject.create({
    objectives
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);

  assert.equal(this.$('.title').text().trim(), 'Objectives (3)');
  assert.equal(this.$('table tr').length, 4);
  assert.equal(this.$('tr:eq(1) td:eq(0)').text().trim(), 'There are 3 objectives');
  assert.equal(this.$('tr:eq(2) td:eq(0)').text().trim(), '1 has a parent');
  assert.equal(this.$('tr:eq(3) td:eq(0)').text().trim(), '1 has MeSH');

  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('fa-circle'));
  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('maybe'));
  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('fa-circle'));
  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('maybe'));
});

test('clicking expand icon opens full view', function(assert) {
  assert.expect(2);

  const course = EmberObject.create();

  this.set('subject', course);
  this.on('click', function() {
    assert.ok(true);
  });

  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);

  assert.equal(this.$('.title').text().trim(), 'Objectives ()');
  this.$('.title').click();
});

test('icons all parents correctly', function(assert) {
  assert.expect(4);
  let objective = server.create('objective', {
    hasParents: true
  });
  let objectives = [objective].map(obj => Ember.Object.create(obj));

  const course = EmberObject.create({
    objectives
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);

  assert.equal(this.$('.title').text().trim(), 'Objectives (1)');
  assert.equal(this.$('table tr').length, 4);

  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('fa-circle'));
  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('yes'));
});

test('icons no parents correctly', function(assert) {
  assert.expect(4);
  let objective = server.create('objective', {
    hasParents: false
  });
  let objectives = [objective].map(obj => Ember.Object.create(obj));

  const course = EmberObject.create({
    objectives
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);

  assert.equal(this.$('.title').text().trim(), 'Objectives (1)');
  assert.equal(this.$('table tr').length, 4);

  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('fa-ban'));
  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('no'));
});

test('icons all mesh correctly', function(assert) {
  assert.expect(4);
  let objective = server.create('objective', {
    hasMesh: true
  });
  let objectives = [objective].map(obj => Ember.Object.create(obj));

  const course = EmberObject.create({
    objectives
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);

  assert.equal(this.$('.title').text().trim(), 'Objectives (1)');
  assert.equal(this.$('table tr').length, 4);

  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('fa-circle'));
  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('yes'));
});

test('icons no mesh correctly', function(assert) {
  assert.expect(4);
  let objective = server.create('objective', {
    hasMesh: false
  });
  let objectives = [objective].map(obj => Ember.Object.create(obj));

  const course = EmberObject.create({
    objectives
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);

  assert.equal(this.$('.title').text().trim(), 'Objectives (1)');
  assert.equal(this.$('table tr').length, 4);

  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('fa-ban'));
  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('no'));
});
