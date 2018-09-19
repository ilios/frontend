import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let hasMesh, hasParents, plain;

module('Integration | Component | collapsed objectives', function(hooks) {
  setupRenderingTest(hooks);

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
    this.set('click', () => {});
    await render(hbs`{{collapsed-objectives subject=subject expand=(action click)}}`);

    assert.dom('.title').hasText('Objectives (3)');
    assert.dom('table tr').exists({ count: 4 });
    assert.dom('tr td').hasText('There are 3 objectives');
    assert.dom('tr:nth-of-type(2) td').hasText('1 has a parent');
    assert.dom('tr:nth-of-type(3) td').hasText('1 has MeSH');

    assert.dom('tr td:nth-of-type(2) svg').hasClass('fa-circle', 'correct icon for parent objectives');
    assert.dom('tr td:nth-of-type(2) svg').hasClass('maybe', 'correct class for parent objectives');
    assert.dom('tr td:nth-of-type(3) svg').hasClass('fa-circle', 'correct icon for mesh links');
    assert.dom('tr td:nth-of-type(3) svg').hasClass('maybe', 'correct class for mesh links');
  });

  test('clicking expand icon opens full view', async function(assert) {
    assert.expect(2);

    const course = EmberObject.create();

    this.set('subject', course);
    this.set('click', () => {
      assert.ok(true);
    });

    await render(hbs`{{collapsed-objectives subject=subject expand=(action click)}}`);
    await settled();

    assert.dom('.title').hasText('Objectives ()');
    await click('.title');
  });

  test('icons all parents correctly', async function(assert) {
    assert.expect(4);

    const course = EmberObject.create({
      objectives: resolve([hasParents])
    });

    this.set('subject', course);
    this.set('click', () => {});
    await render(hbs`{{collapsed-objectives subject=subject expand=(action click)}}`);
    await settled();

    assert.dom('.title').hasText('Objectives (1)');
    assert.dom('table tr').exists({ count: 4 });

    assert.dom('tr td:nth-of-type(2) svg').hasClass('fa-circle', 'has the correct icon');
    assert.dom('tr td:nth-of-type(2) svg').hasClass('yes', 'icon has the right class');
  });

  test('icons no parents correctly', async function(assert) {
    assert.expect(4);
    const course = EmberObject.create({
      objectives: resolve([plain])
    });

    this.set('subject', course);
    this.set('click', () => {});
    await render(hbs`{{collapsed-objectives subject=subject expand=(action click)}}`);
    await settled();

    assert.dom('.title').hasText('Objectives (1)');
    assert.dom('table tr').exists({ count: 4 });

    assert.dom('tr td:nth-of-type(2) svg').hasClass('fa-ban', 'has the correct icon');
    assert.dom('tr td:nth-of-type(2) svg').hasClass('no', 'icon has the right class');
  });

  test('icons all mesh correctly', async function(assert) {
    assert.expect(4);
    const course = EmberObject.create({
      objectives: resolve([hasMesh])
    });

    this.set('subject', course);
    this.set('click', () => {});
    await render(hbs`{{collapsed-objectives subject=subject expand=(action click)}}`);
    await settled();

    assert.dom('.title').hasText('Objectives (1)');
    assert.dom('table tr').exists({ count: 4 });

    assert.dom('tr td:nth-of-type(3) svg').hasClass('fa-circle', 'has the correct icon');
    assert.dom('tr td:nth-of-type(3) svg').hasClass('yes', 'icon has the right class');
  });

  test('icons no mesh correctly', async function(assert) {
    assert.expect(4);
    const course = EmberObject.create({
      objectives: resolve([plain])
    });

    this.set('subject', course);
    this.set('click', () => {});
    await render(hbs`{{collapsed-objectives subject=subject expand=(action click)}}`);
    await settled();

    assert.dom('.title').hasText('Objectives (1)');
    assert.dom('table tr').exists({ count: 4 });

    assert.dom('tr td:nth-of-type(3) svg').hasClass('fa-ban', 'has the correct icon');
    assert.dom('tr td:nth-of-type(3) svg').hasClass('no', 'icon has the right class');
  });
});
