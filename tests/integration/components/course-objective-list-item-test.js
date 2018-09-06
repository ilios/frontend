import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


const { resolve } = RSVP;

module('Integration | Component | course objective list item', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title',
    });
    this.set('objective', objective);
    this.set('nothing', () => {});

    await render(hbs`{{course-objective-list-item
      objective=objective
      remove=(action nothing)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
    }}`);

    assert.equal(find('td').textContent.trim(), 'fake title');
    assert.equal(find('td:nth-of-type(2) button').textContent.trim(), 'Add New');
    assert.equal(find('td:nth-of-type(3) button').textContent.trim(), 'Add New');
    assert.equal(findAll('td:nth-of-type(4) svg').length, 1);
  });

  test('renders removable', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title',
    });
    this.set('objective', objective);
    this.set('nothing', () => {});

    await render(hbs`{{course-objective-list-item
      objective=objective
      showRemoveConfirmation=true
      remove=(action nothing)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
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
    this.set('nothing', () => {});

    await render(hbs`{{course-objective-list-item
      objective=objective
      remove=(action nothing)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
    }}`);

    await click('td:nth-of-type(1) .editable');
    find('td:nth-of-type(1) .fr-box').froalaEditor('html.set', 'new title');
    find('td:nth-of-type(1) .fr-box').froalaEditor('events.trigger', 'contentChanged');
    await click('td:nth-of-type(1) .done');

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

    await render(hbs`{{course-objective-list-item
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

    await render(hbs`{{course-objective-list-item
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

    await render(hbs`{{course-objective-list-item
      objective=objective
      remove=(action something)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
    }}`);

    await click('td:nth-of-type(4) svg');

  });

  test('read-only mode', async function(assert) {
    let objective = EmberObject.create({
      title: 'fake title',
    });
    this.set('objective', objective);
    this.set('nothing', () => {});
    await render(hbs`{{course-objective-list-item
      objective=objective
      editable=false
      remove=(action nothing)
      manageParents=(action nothing)
      manageDescriptors=(action nothing)
    }}`);

    assert.equal(find('td').textContent.trim(), 'fake title');
    assert.equal(findAll('td:nth-of-type(1) .editable').length, 0, 'No in-place editor in read-only mode');
    assert.equal(findAll('td:nth-of-type(2) button').length, 0, 'No edit button for parent objectives in read-only mode.');
    assert.equal(find(findAll('td')[2]).textContent.trim(), 'None');
    assert.equal(findAll('td:nth-of-type(3) button').length, 0, 'No edit button for MeSH terms in read-only mode.');
    assert.equal(find(findAll('td')[3]).textContent.trim(), '', 'No actions available in read-only mode.');
  });
});
