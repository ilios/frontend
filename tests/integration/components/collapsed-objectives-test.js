import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let hasMesh, hasParents, plain;

module('Integration | Component | collapsed objectives', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  hooks.beforeEach(function() {
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
  });

  test('displays summary data', async function(assert) {
    assert.expect(9);

    const course = EmberObject.create({
      objectives: resolve([hasMesh, hasParents, plain])
    });

    this.set('subject', course);
    this.actions.click = parseInt;
    await render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
    await settled();

    assert.equal(find('.title').textContent.trim(), 'Objectives (3)');
    assert.equal(findAll('table tr').length, 4);
    assert.equal(find('tr:eq(1) td').textContent.trim(), 'There are 3 objectives');
    assert.equal(find('tr:eq(2) td').textContent.trim(), '1 has a parent');
    assert.equal(find('tr:eq(3) td').textContent.trim(), '1 has MeSH');

    assert.ok(find('tr:eq(1) td:eq(1) i').classList.contains('fa-circle'), 'correct icon for parent objectives');
    assert.ok(find('tr:eq(1) td:eq(1) i').classList.contains('maybe'), 'correct class for parent objectives');
    assert.ok(find('tr:eq(1) td:eq(2) i').classList.contains('fa-circle'), 'correct icon for mesh links');
    assert.ok(find('tr:eq(1) td:eq(2) i').classList.contains('maybe'), 'correct class for mesh links');
  });

  test('clicking expand icon opens full view', async function(assert) {
    assert.expect(2);

    const course = EmberObject.create();

    this.set('subject', course);
    this.actions.click = function() {
      assert.ok(true);
    };

    await render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
    await settled();

    assert.equal(find('.title').textContent.trim(), 'Objectives ()');
    await click('.title');
  });

  test('icons all parents correctly', async function(assert) {
    assert.expect(4);

    const course = EmberObject.create({
      objectives: resolve([hasParents])
    });

    this.set('subject', course);
    this.actions.click = parseInt;
    await render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
    await settled();

    assert.equal(find('.title').textContent.trim(), 'Objectives (1)');
    assert.equal(findAll('table tr').length, 4);

    assert.ok(find('tr:eq(1) td:eq(1) i').classList.contains('fa-circle'), 'has the correct icon');
    assert.ok(find('tr:eq(1) td:eq(1) i').classList.contains('yes'), 'icon has the right class');
  });

  test('icons no parents correctly', async function(assert) {
    assert.expect(4);
    const course = EmberObject.create({
      objectives: resolve([plain])
    });

    this.set('subject', course);
    this.actions.click = parseInt;
    await render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
    await settled();

    assert.equal(find('.title').textContent.trim(), 'Objectives (1)');
    assert.equal(findAll('table tr').length, 4);

    assert.ok(find('tr:eq(1) td:eq(1) i').classList.contains('fa-ban'), 'has the correct icon');
    assert.ok(find('tr:eq(1) td:eq(1) i').classList.contains('no'), 'icon has the right class');
  });

  test('icons all mesh correctly', async function(assert) {
    assert.expect(4);
    const course = EmberObject.create({
      objectives: resolve([hasMesh])
    });

    this.set('subject', course);
    this.actions.click = parseInt;
    await render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
    await settled();

    assert.equal(find('.title').textContent.trim(), 'Objectives (1)');
    assert.equal(findAll('table tr').length, 4);

    assert.ok(find('tr:eq(1) td:eq(2) i').classList.contains('fa-circle'), 'has the correct icon');
    assert.ok(find('tr:eq(1) td:eq(2) i').classList.contains('yes'), 'icon has the right class');
  });

  test('icons no mesh correctly', async function(assert) {
    assert.expect(4);
    const course = EmberObject.create({
      objectives: resolve([plain])
    });

    this.set('subject', course);
    this.actions.click = parseInt;
    await render(hbs`{{collapsed-objectives subject=subject expand=(action 'click')}}`);
    await settled();

    assert.equal(find('.title').textContent.trim(), 'Objectives (1)');
    assert.equal(findAll('table tr').length, 4);

    assert.ok(find('tr:eq(1) td:eq(2) i').classList.contains('fa-ban'), 'has the correct icon');
    assert.ok(find('tr:eq(1) td:eq(2) i').classList.contains('no'), 'icon has the right class');
  });
});
