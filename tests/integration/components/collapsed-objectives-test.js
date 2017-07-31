import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

let hasMesh, hasParents, plain;

moduleForComponent('collapsed-objectives', 'Integration | Component | collapsed objectives', {
  integration: true,
  beforeEach(){
    hasMesh = EmberObject.create({
      id: 1,
      hasMany(what){
        return {
          ids(){
            if (what === 'meshDescriptors') {
              return [1];
            }

            return [];
          }
        };
      }
    });
    hasParents = EmberObject.create({
      id: 1,
      hasMany(what){
        return {
          ids(){
            if (what === 'parents') {
              return [1];
            }

            return [];
          }
        };
      }
    });

    plain = EmberObject.create({
      id: 1,
      hasMany(){
        return {
          ids(){
            return [];
          }
        };
      }
    });
  }
});

test('displays summary data', async function(assert) {
  assert.expect(9);

  const course = EmberObject.create({
    objectives: resolve([hasMesh, hasParents, plain])
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
  await wait();

  assert.equal(this.$('.title').text().trim(), 'Objectives (3)');
  assert.equal(this.$('table tr').length, 4);
  assert.equal(this.$('tr:eq(1) td:eq(0)').text().trim(), 'There are 3 objectives');
  assert.equal(this.$('tr:eq(2) td:eq(0)').text().trim(), '1 has a parent');
  assert.equal(this.$('tr:eq(3) td:eq(0)').text().trim(), '1 has MeSH');

  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('fa-circle'), 'correct icon for parent objectives');
  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('maybe'), 'correct class for parent objectives');
  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('fa-circle'), 'correct icon for mesh links');
  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('maybe'), 'correct class for mesh links');
});

test('clicking expand icon opens full view', async function(assert) {
  assert.expect(2);

  const course = EmberObject.create();

  this.set('subject', course);
  this.on('click', function() {
    assert.ok(true);
  });

  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
  await wait();

  assert.equal(this.$('.title').text().trim(), 'Objectives ()');
  this.$('.title').click();
});

test('icons all parents correctly', async function(assert) {
  assert.expect(4);

  const course = EmberObject.create({
    objectives: resolve([hasParents])
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
  await wait();

  assert.equal(this.$('.title').text().trim(), 'Objectives (1)');
  assert.equal(this.$('table tr').length, 4);

  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('fa-circle'), 'has the correct icon');
  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('yes'), 'icon has the right class');
});

test('icons no parents correctly', async function(assert) {
  assert.expect(4);
  const course = EmberObject.create({
    objectives: resolve([plain])
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
  await wait();

  assert.equal(this.$('.title').text().trim(), 'Objectives (1)');
  assert.equal(this.$('table tr').length, 4);

  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('fa-ban'), 'has the correct icon');
  assert.ok(this.$('tr:eq(1) td:eq(1) i').hasClass('no'), 'icon has the right class');
});

test('icons all mesh correctly', async function(assert) {
  assert.expect(4);
  const course = EmberObject.create({
    objectives: resolve([hasMesh])
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
  await wait();

  assert.equal(this.$('.title').text().trim(), 'Objectives (1)');
  assert.equal(this.$('table tr').length, 4);

  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('fa-circle'), 'has the correct icon');
  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('yes'), 'icon has the right class');
});

test('icons no mesh correctly', async function(assert) {
  assert.expect(4);
  const course = EmberObject.create({
    objectives: resolve([plain])
  });

  this.set('subject', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
  await wait();

  assert.equal(this.$('.title').text().trim(), 'Objectives (1)');
  assert.equal(this.$('table tr').length, 4);

  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('fa-ban'), 'has the correct icon');
  assert.ok(this.$('tr:eq(1) td:eq(2) i').hasClass('no'), 'icon has the right class');
});
