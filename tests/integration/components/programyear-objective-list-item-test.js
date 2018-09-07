import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { fillInFroalaEditor } from 'ember-froala-editor/test-support';

const { resolve } = RSVP;

module('Integration | Component | programyear objective list item', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.set('nothing', () => {});

    await render(hbs`{{programyear-objective-list-item
      objective=objective
      manageDescriptors=(action nothing)
      manageCompetency=(action nothing)
      toggleExpand=(action nothing)
      editable=true
    }}`);

    assert.equal(find(findAll('td')[1]).textContent.trim(), 'fake title');
    assert.equal(find('td:nth-of-type(3) button').textContent.trim(), 'Add New');
    assert.equal(find('td:nth-of-type(4) button').textContent.trim(), 'Add New');
  });


  test('can change title', async function (assert) {
    assert.expect(1);
    let objective = EmberObject.create({
      title: 'fake title',
      save(){
        assert.equal(this.get('title'), '<p>new title</p>');
        return resolve();
      }
    });
    this.set('objective', objective);
    this.set('nothing', () => {});

    await render(hbs`{{programyear-objective-list-item
      objective=objective
      remove=(action nothing)
      manageDescriptors=(action nothing)
      manageCompetency=(action nothing)
      toggleExpand=(action nothing)
      editable=true
    }}`);

    await click('td:nth-of-type(2) .editable');
    await fillInFroalaEditor('td:nth-of-type(2) .froala-editor-container', 'new title');
    await click('td:nth-of-type(2) .done');
  });

  test('can manage competency', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.set('nothing', () => {});
    this.set('something', ()=>{
      assert.ok(true);
    });

    await render(hbs`{{programyear-objective-list-item
      objective=objective
      remove=(action nothing)
      manageDescriptors=(action nothing)
      manageCompetency=(action something)
      toggleExpand=(action nothing)
      editable=true
    }}`);

    await click('td:nth-of-type(3) button');

  });

  test('can manage descriptors', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.set('nothing', () => {});
    this.set('something', ()=>{
      assert.ok(true);
    });

    await render(hbs`{{programyear-objective-list-item
      objective=objective
      remove=(action nothing)
      manageDescriptors=(action something)
      manageCompetency=(action nothing)
      toggleExpand=(action nothing)
      editable=true
    }}`);

    await click('td:nth-of-type(4) button');

  });

  test('can expand', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.set('nothing', () => {});
    this.set('something', ()=>{
      assert.ok(true);
    });

    await render(hbs`{{programyear-objective-list-item
      objective=objective
      remove=(action nothing)
      manageDescriptors=(action nothing)
      manageCompetency=(action nothing)
      toggleExpand=(action something)
      editable=true
    }}`);

    await click(find('td'));

  });
});
