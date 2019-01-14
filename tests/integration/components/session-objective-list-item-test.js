import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { fillInFroalaEditor } from 'ember-froala-editor/test-support';

const { resolve } = RSVP;

module('Integration | Component | session objective list item', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title',
    });
    this.set('objective', objective);
    this.set('nothing', () => {});

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action nothing)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
    }}`);

    assert.dom('td').hasText('fake title');
    assert.dom('td:nth-of-type(2) button').hasText('Add New');
    assert.dom('td:nth-of-type(3) button').hasText('Add New');
    assert.dom('td:nth-of-type(4) svg').exists({ count: 1 });
  });

  test('renders removable', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title',
    });
    this.set('objective', objective);
    this.set('nothing', () => {});

    await render(hbs`{{session-objective-list-item
      objective=objective
      showRemoveConfirmation=true
      remove=(action nothing)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
    }}`);

    assert.dom('tr').hasClass('confirm-removal');
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
    this.set('nothing', () => {});

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action nothing)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
    }}`);

    await click('td:nth-of-type(1) .editable');
    await fillInFroalaEditor('td:nth-of-type(1) .froala-editor-container', 'new title');
    await click('td:nth-of-type(1) .done');
  });

  test('can manage parents', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title',
    });
    this.set('objective', objective);
    this.set('nothing', () => {});
    this.set('something', () => {
      assert.ok(true);
    });

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action nothing)
      manageParents=(action something)
      manageDescriptors=(action nothing)
    }}`);

    await click('td:nth-of-type(2) button');

  });

  test('can manage descriptors', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title',
    });
    this.set('objective', objective);
    this.set('nothing', () => {});
    this.set('something', () => {
      assert.ok(true);
    });

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action nothing)
      manageParents=(action nothing)
      manageDescriptors=(action something)
    }}`);

    await click('td:nth-of-type(3) button');

  });

  test('can trigger removal', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title',
    });
    this.set('objective', objective);
    this.set('nothing', () => {});
    this.set('something', () => {
      assert.ok(true);
    });

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action something)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
    }}`);

    await click('td:nth-of-type(4) svg');

  });
});
