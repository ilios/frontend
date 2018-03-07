import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | session objective list item', function(hooks) {
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

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'nothing')
    }}`);

    assert.equal(find('td').textContent.trim(), 'fake title');
    assert.equal(find('td:eq(1) button').textContent.trim(), 'Add New');
    assert.equal(find('td:eq(2) button').textContent.trim(), 'Add New');
    assert.equal(findAll('td:eq(3) i').length, 1);
  });

  test('renders removable', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;

    await render(hbs`{{session-objective-list-item
      objective=objective
      showRemoveConfirmation=true
      remove=(action 'nothing')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'nothing')
    }}`);

    assert.ok(find('tr').classList.contains('confirm-removal'));
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

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'nothing')
    }}`);

    await click('td:eq(0) .editable');
    this.$('td:eq(0) .fr-box').froalaEditor('html.set', 'new title');
    this.$('td:eq(0) .fr-box').froalaEditor('events.trigger', 'contentChanged');
    await click('td:eq(0) .done');

    await settled();
  });

  test('can manage parents', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;
    this.actions.something = ()=>{
      assert.ok(true);
    };

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageParents=(action 'something')
      manageDescriptors=(action 'nothing')
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

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'something')
    }}`);

    await click('td:eq(2) button');

  });

  test('can trigger removal', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;
    this.actions.something = ()=>{
      assert.ok(true);
    };

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action 'something')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'nothing')
    }}`);

    await click('td:eq(3) i');

  });
});
