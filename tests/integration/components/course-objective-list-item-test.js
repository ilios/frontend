import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/load-common-translations";

const { resolve } = RSVP;

module('Integration | Component | course objective list item', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      initializer.initialize(this.owner);
    };

    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;

    await render(hbs`{{course-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'nothing')
    }}`);

    assert.equal(this.$('td:eq(0)').text().trim(), 'fake title');
    assert.equal(this.$('td:eq(1) button').text().trim(), 'Add New');
    assert.equal(this.$('td:eq(2) button').text().trim(), 'Add New');
    assert.equal(this.$('td:eq(3) i').length, 1);
  });

  test('renders removable', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;

    await render(hbs`{{course-objective-list-item
      objective=objective
      showRemoveConfirmation=true
      remove=(action 'nothing')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'nothing')
    }}`);

    assert.ok(this.$('tr').hasClass('confirm-removal'));
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

    await render(hbs`{{course-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'nothing')
    }}`);

    this.$('td:eq(0) .editable').click();
    this.$('td:eq(0) .fr-box').froalaEditor('html.set', 'new title');
    this.$('td:eq(0) .fr-box').froalaEditor('events.trigger', 'contentChanged');
    this.$('td:eq(0) .done').click();

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

    await render(hbs`{{course-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageParents=(action 'something')
      manageDescriptors=(action 'nothing')
    }}`);

    this.$('td:eq(1) button').click();

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

    await render(hbs`{{course-objective-list-item
      objective=objective
      remove=(action 'nothing')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'something')
    }}`);

    this.$('td:eq(2) button').click();

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

    await render(hbs`{{course-objective-list-item
      objective=objective
      remove=(action 'something')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'nothing')
    }}`);

    this.$('td:eq(3) i').click();

  });

  test('read-only mode', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title'
    });
    this.set('objective', objective);
    this.actions.nothing = parseInt;
    await render(hbs`{{course-objective-list-item
      objective=objective
      editable=false
      remove=(action 'nothing')
      manageParents=(action 'nothing')
      manageDescriptors=(action 'nothing')
    }}`);

    assert.equal(this.$('td:eq(0)').text().trim(), 'fake title');
    assert.equal(this.$('td:eq(0) .editable').length, 0, 'No in-place editor in read-only mode');
    assert.equal(this.$('td:eq(1) button').length, 0, 'No edit button for parent objectives in read-only mode.');
    assert.equal(this.$('td:eq(2)').text().trim(), 'None');
    assert.equal(this.$('td:eq(2) button').length, 0, 'No edit button for MeSH terms in read-only mode.');
    assert.equal(this.$('td:eq(3)').text().trim(), '', 'No actions available in read-only mode.');
  });
});