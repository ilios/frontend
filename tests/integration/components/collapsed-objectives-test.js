import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import DS from 'ember-data';
import startMirage from '../../helpers/start-mirage';

const { Object, RSVP } = Ember;
const { PromiseArray } = DS;

moduleForComponent('collapsed-objectives', 'Integration | Component | collapsed objectives', {
  integration: true,
  setup(){
    startMirage(this.container);
  }
});

test('displays all objectives', function(assert) {
  assert.expect(11);
  server.create('meshDescriptor');
  let hasMesh = server.create('objective', {
    meshDescriptors: [1]
  });
  let hasParents = server.create('objective', {
    parents: [1]
  });
  let plain = server.create('objective');
  let objectives = [hasMesh, hasParents, plain].map(obj => Ember.Object.create(obj));

  const course = Object.create({
    objectives
  });

  this.set('subject', course);
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{collapsed-objectives subject=subject isCourse=true}}`);

  assert.equal(this.$('.detail-title').text().trim(), 'Objectives (3)');
  assert.equal(this.$('table tr').length, 4);
  assert.equal(this.$('tr:eq(1)').text().trim(), objectives[0].get('title'));
  assert.equal(this.$('tr:eq(2)').text().trim(), objectives[1].get('title'));
  assert.equal(this.$('tr:eq(3)').text().trim(), objectives[2].get('title'));


  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('fa-ban'));
  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('fa-circle'));

  assert.ok(this.$('tr:eq(2) td:eq(1) i').hasClass('fa-circle'));
  assert.ok(this.$('tr:eq(2) td:eq(2) i').hasClass('fa-ban'));

  assert.ok(this.$('tr:eq(3) td:eq(1) i').hasClass('fa-ban'));
  assert.ok(this.$('tr:eq(3) td:eq(2) i').hasClass('fa-ban'));
});

test('clicking objective title opens full view', function(assert) {
  assert.expect(2);

  let objective = server.create('objective');
  let objectives = [objective].map(obj => Ember.Object.create(obj));

  const course = Object.create({
    objectives
  });

  this.set('subject', course);
  this.on('click', function() {
    assert.ok(true);
  });

  this.render(hbs`{{collapsed-objectives subject=subject isCourse=true toggleObjectiveDetails='click'}}`);

  assert.equal(this.$('.detail-title').text().trim(), 'Objectives (1)');
  this.$('tr:eq(1) td span').click()
});

test('clicking expand icon opens full view', function(assert) {
  assert.expect(2);

  const course = Object.create();

  this.set('subject', course);
  this.on('click', function() {
    assert.ok(true);
  });

  this.render(hbs`{{collapsed-objectives subject=subject isCourse=true toggleObjectiveDetails='click'}}`);

  assert.equal(this.$('.detail-title').text().trim(), 'Objectives ()');
  this.$('.detail-title i').click()
});
