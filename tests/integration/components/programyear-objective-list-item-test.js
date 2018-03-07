import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | programyear objective list item', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;

    await render(hbs`{{programyear-objective-list-item
      objective=objective
      manageDescriptors=(action 'nothing')
      manageCompetency=(action 'nothing')
      editable=true
    }}`);

    assert.equal(find('td').textContent.trim(), 'fake title');
    assert.equal(find('td:eq(1) button').textContent.trim(), 'Add New');
    assert.equal(find('td:eq(2) button').textContent.trim(), 'Add New');
  });


  test('can change title', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title',
      save(){
        assert.equal(this.get('title'), '<p>new title</p>');
        return resolve();
      }
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;

    await render(hbs`{{programyear-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageDescriptors=(action 'nothing')
      manageCompetency=(action 'nothing')
      editable=true
    }}`);

    await click('td:eq(0) .editable');
    this.$('td:eq(0) .fr-box').froalaEditor('html.set', 'new title');
    this.$('td:eq(0) .fr-box').froalaEditor('events.trigger', 'contentChanged');
    await click('td:eq(0) .done');

    await settled();
  });

  test('can manage competency', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;
    this.actions.something = ()=>{
      assert.ok(true);
    };

    await render(hbs`{{programyear-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageDescriptors=(action 'nothing')
      manageCompetency=(action 'something')
      editable=true
    }}`);

    await click('td:eq(1) button');

  });

  test('can manage descriptors', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;
    this.actions.something = ()=>{
      assert.ok(true);
    };

    await render(hbs`{{programyear-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageDescriptors=(action 'something')
      manageCompetency=(action 'nothing')
      editable=true
    }}`);

    await click('td:eq(2) button');

  });
});
