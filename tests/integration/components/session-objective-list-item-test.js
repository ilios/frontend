import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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

    assert.equal(this.$('td:eq(0)').text().trim(), 'fake title');
    assert.equal(this.$('td:eq(1) button').text().trim(), 'Add New');
    assert.equal(this.$('td:eq(2) button').text().trim(), 'Add New');
    assert.equal(this.$('td:eq(3) svg').length, 1);
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
    this.set('nothing', () => {});

    await render(hbs`{{session-objective-list-item
      objective=objective
      remove=(action nothing)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
    }}`);

    this.$('td:eq(0) .editable').click();
    this.$('td:eq(0) .fr-box').froalaEditor('html.set', 'new title');
    this.$('td:eq(0) .fr-box').froalaEditor('events.trigger', 'contentChanged');
    this.$('td:eq(0) .done').click();

    await settled();
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

    this.$('td:eq(1) button').click();

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

    this.$('td:eq(2) button').click();

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

    this.$('td:eq(3) svg').click();

  });
});
