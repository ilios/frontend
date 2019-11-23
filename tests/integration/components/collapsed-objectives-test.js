import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/collapsed-objectives';

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
    const course = EmberObject.create({
      objectives: resolve([hasMesh, hasParents, plain])
    });

    this.set('subject', course);
    this.set('click', () => {});
    await render(hbs`<CollapsedObjectives @subject={{subject}} @expand={{action click}} />`);

    assert.equal(component.title, 'Objectives (3)');
    assert.equal(component.objectiveCount, 'There are 3 objectives');
    assert.equal(component.parentCount, '1 has a parent');
    assert.equal(component.meshCount, '1 has MeSH');
    assert.ok(component.parentStatus.partial);
    assert.ok(component.meshStatus.partial);
  });

  test('clicking expand icon opens full view', async function(assert) {
    assert.expect(2);

    const course = EmberObject.create({
      objectives: resolve([])
    });

    this.set('subject', course);
    this.set('click', () => {
      assert.ok(true);
    });

    await render(hbs`<CollapsedObjectives @subject={{subject}} @expand={{action click}} />`);

    assert.equal(component.title, 'Objectives (0)');
    await component.expand();
  });

  test('icons all parents correctly', async function(assert) {

    const course = EmberObject.create({
      objectives: resolve([hasParents])
    });

    this.set('subject', course);
    this.set('click', () => {});
    await render(hbs`<CollapsedObjectives @subject={{subject}} @expand={{action click}} />`);
    assert.equal(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.complete);
  });

  test('icons no parents correctly', async function(assert) {
    const course = EmberObject.create({
      objectives: resolve([plain])
    });

    this.set('subject', course);
    this.set('click', () => {});
    await render(hbs`<CollapsedObjectives @subject={{subject}} @expand={{action click}} />`);
    assert.equal(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.none);
  });

  test('icons all mesh correctly', async function(assert) {
    const course = EmberObject.create({
      objectives: resolve([hasMesh])
    });

    this.set('subject', course);
    this.set('click', () => {});
    await render(hbs`<CollapsedObjectives @subject={{subject}} @expand={{action click}} />`);
    assert.equal(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.complete);
  });

  test('icons no mesh correctly', async function(assert) {
    const course = EmberObject.create({
      objectives: resolve([plain])
    });

    this.set('subject', course);
    this.set('click', () => {});
    await render(hbs`<CollapsedObjectives @subject={{subject}} @expand={{action click}} />`);
    assert.equal(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.none);
  });
});
