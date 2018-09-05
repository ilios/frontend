import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | programyear objective list item', function(hooks) {
  setupRenderingTest(hooks);

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
      toggleExpand=(action 'nothing')
      editable=true
    }}`);

    assert.equal(this.$('td:eq(1)').text().trim(), 'fake title');
    assert.equal(this.$('td:eq(2) button').text().trim(), 'Add New');
    assert.equal(this.$('td:eq(3) button').text().trim(), 'Add New');
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
      toggleExpand=(action 'nothing')
      editable=true
    }}`);

    this.$('td:eq(1) .editable').click();
    this.$('td:eq(1) .fr-box').froalaEditor('html.set', 'new title');
    this.$('td:eq(1) .fr-box').froalaEditor('events.trigger', 'contentChanged');
    this.$('td:eq(1) .done').click();

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
      toggleExpand=(action 'nothing')
      editable=true
    }}`);

    this.$('td:eq(2) button').click();

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
      toggleExpand=(action 'nothing')
      editable=true
    }}`);

    this.$('td:eq(3) button').click();

  });

  test('can expand', async function(assert) {
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
      manageCompetency=(action 'nothing')
      toggleExpand=(action 'something')
      editable=true
    }}`);

    this.$('td:eq(0)').click();

  });
});
