import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/session/postrequisite-editor';

module('Integration | Component | session/postrequisite-editor', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders with no postrequisite selected', async function (assert) {
    const sessions = this.server.createList('session', 5);
    this.server.create('course', {
      sessions,
    });
    const sessionModel = await this.owner
      .lookup('service:store')
      .findRecord('session', sessions[2].id);
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{(noop)}}
     @session={{this.session}}
    />`);
    assert.strictEqual(component.selectedPostrequisiteLabel, 'Due prior to:');
    assert.strictEqual(component.selectedPostrequisiteTitle, 'None');
    assert.strictEqual(component.postRequisites.length, 4);
    assert.false(component.postRequisites[0].isSelected);
    assert.false(component.postRequisites[1].isSelected);
    assert.false(component.postRequisites[2].isSelected);
    assert.false(component.postRequisites[3].isSelected);
  });

  test('it renders with a postrequisite selected', async function (assert) {
    const sessions = this.server.createList('session', 4);
    const course = this.server.create('course', {
      sessions,
    });
    const session = this.server.create('session', {
      postrequisite: sessions[1],
      course,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{(noop)}}
     @session={{this.session}}
    />`);
    assert.strictEqual(component.selectedPostrequisiteTitle, 'session 1');
    assert.strictEqual(component.postRequisites.length, 4);
    assert.false(component.postRequisites[0].isSelected);
    assert.true(component.postRequisites[1].isSelected);
    assert.false(component.postRequisites[2].isSelected);
    assert.false(component.postRequisites[3].isSelected);
  });

  test('can remove postrequisite from header', async function (assert) {
    const sessions = this.server.createList('session', 4);
    const course = this.server.create('course', {
      sessions,
    });
    const session = this.server.create('session', {
      postrequisite: sessions[1],
      course,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{(noop)}}
     @session={{this.session}}
    />`);
    assert.strictEqual(component.selectedPostrequisiteTitle, 'session 1');
    assert.strictEqual(component.postRequisites.length, 4);
    assert.false(component.postRequisites[0].isSelected);
    assert.true(component.postRequisites[1].isSelected);
    assert.false(component.postRequisites[2].isSelected);
    assert.false(component.postRequisites[3].isSelected);

    await component.removeSelectedPostrequisite();
    assert.strictEqual(component.selectedPostrequisiteTitle, 'None');
    assert.false(component.postRequisites[0].isSelected);
    assert.false(component.postRequisites[1].isSelected);
    assert.false(component.postRequisites[2].isSelected);
    assert.false(component.postRequisites[3].isSelected);
  });

  test('can remove postrequisite from row', async function (assert) {
    const sessions = this.server.createList('session', 4);
    const course = this.server.create('course', {
      sessions,
    });
    const session = this.server.create('session', {
      postrequisite: sessions[1],
      course,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{(noop)}}
     @session={{this.session}}
    />`);
    assert.strictEqual(component.selectedPostrequisiteTitle, 'session 1');
    assert.strictEqual(component.postRequisites.length, 4);
    assert.false(component.postRequisites[0].isSelected);
    assert.true(component.postRequisites[1].isSelected);
    assert.false(component.postRequisites[2].isSelected);
    assert.false(component.postRequisites[3].isSelected);

    await component.postRequisites[1].click();
    assert.strictEqual(component.selectedPostrequisiteTitle, 'None');
    assert.false(component.postRequisites[0].isSelected);
    assert.false(component.postRequisites[1].isSelected);
    assert.false(component.postRequisites[2].isSelected);
    assert.false(component.postRequisites[3].isSelected);
  });

  test('can add postrequisite from row', async function (assert) {
    const sessions = this.server.createList('session', 5);
    this.server.create('course', {
      sessions,
    });
    const sessionModel = await this.owner
      .lookup('service:store')
      .findRecord('session', sessions[0].id);
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{(noop)}}
     @session={{this.session}}
    />`);
    assert.strictEqual(component.selectedPostrequisiteTitle, 'None');
    assert.strictEqual(component.postRequisites.length, 4);
    assert.false(component.postRequisites[0].isSelected);
    assert.false(component.postRequisites[1].isSelected);
    assert.false(component.postRequisites[2].isSelected);
    assert.false(component.postRequisites[3].isSelected);

    await component.postRequisites[1].click();
    assert.strictEqual(component.selectedPostrequisiteTitle, 'session 2');
    assert.false(component.postRequisites[0].isSelected);
    assert.true(component.postRequisites[1].isSelected);
    assert.false(component.postRequisites[2].isSelected);
    assert.false(component.postRequisites[3].isSelected);
  });

  test('closes when canceled', async function (assert) {
    assert.expect(1);
    const sessions = this.server.createList('session', 5);
    this.server.create('course', {
      sessions,
    });
    const sessionModel = await this.owner
      .lookup('service:store')
      .findRecord('session', sessions[0].id);
    this.set('close', () => {
      assert.ok(true);
    });
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{this.close}}
     @session={{this.session}}
    />`);
    await component.close();
  });

  test('closes when saved', async function (assert) {
    assert.expect(1);
    const sessions = this.server.createList('session', 5);
    this.server.create('course', {
      sessions,
    });
    const sessionModel = await this.owner
      .lookup('service:store')
      .findRecord('session', sessions[0].id);
    this.set('close', () => {
      assert.ok(true);
    });
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{this.close}}
     @session={{this.session}}
    />`);
    await component.save();
  });

  test('filters by title', async function (assert) {
    const course = this.server.create('course');
    const session = this.server.create('session', {
      course,
    });
    this.server.create('session', {
      title: 'jasper dog',
      course,
    });
    this.server.create('session', {
      title: 'jackson dog',
      course,
    });
    this.server.create('session', {
      title: 'fuzzy the cat',
      course,
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{(noop)}}
     @session={{this.session}}
    />`);
    assert.strictEqual(component.postRequisites.length, 3);
    assert.strictEqual(component.postRequisites[0].title, 'fuzzy the cat');
    assert.strictEqual(component.postRequisites[1].title, 'jackson dog');
    assert.strictEqual(component.postRequisites[2].title, 'jasper dog');
    await component.filterBy('dog');
    assert.strictEqual(component.postRequisites.length, 2);
    assert.strictEqual(component.postRequisites[0].title, 'jackson dog');
    assert.strictEqual(component.postRequisites[1].title, 'jasper dog');

    await component.filterBy('cat');
    assert.strictEqual(component.postRequisites.length, 1);
    assert.strictEqual(component.postRequisites[0].title, 'fuzzy the cat');

    await component.filterBy('jasper');
    assert.strictEqual(component.postRequisites.length, 1);
    assert.strictEqual(component.postRequisites[0].title, 'jasper dog');
  });
});
