import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/session/postrequisite-editor';

module('Integration | Component | session/postrequisite-editor', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders with no postrequisite selected', async function (assert) {
    const sessions = this.server.createList('session', 5);
    this.server.create('course', {
      sessions
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', sessions[2].id);
    this.set('nothing', () => {});
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{this.nothing}}
     @session={{this.session}}
    />`);
    assert.equal(component.selectedPostrequisiteLabel, 'Due prior to:');
    assert.equal(component.selectedPostrequisiteTitle, 'None');
    assert.equal(component.postRequisites.length, 4);
    assert.equal(component.postRequisites[0].isSelected, false);
    assert.equal(component.postRequisites[1].isSelected, false);
    assert.equal(component.postRequisites[2].isSelected, false);
    assert.equal(component.postRequisites[3].isSelected, false);
  });

  test('it renders with a postrequisite selected', async function (assert) {
    const sessions = this.server.createList('session', 4);
    const course = this.server.create('course', {
      sessions
    });
    const session = this.server.create('session', {
      postrequisite: sessions[1],
      course
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('nothing', () => {});
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{this.nothing}}
     @session={{this.session}}
    />`);
    assert.equal(component.selectedPostrequisiteTitle, 'session 1');
    assert.equal(component.postRequisites.length, 4);
    assert.equal(component.postRequisites[0].isSelected, false);
    assert.equal(component.postRequisites[1].isSelected, true);
    assert.equal(component.postRequisites[2].isSelected, false);
    assert.equal(component.postRequisites[3].isSelected, false);
  });

  test('can remove postrequisite from header', async function (assert) {
    const sessions = this.server.createList('session', 4);
    const course = this.server.create('course', {
      sessions
    });
    const session = this.server.create('session', {
      postrequisite: sessions[1],
      course
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('nothing', () => {});
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{this.nothing}}
     @session={{this.session}}
    />`);
    assert.equal(component.selectedPostrequisiteTitle, 'session 1');
    assert.equal(component.postRequisites.length, 4);
    assert.equal(component.postRequisites[0].isSelected, false);
    assert.equal(component.postRequisites[1].isSelected, true);
    assert.equal(component.postRequisites[2].isSelected, false);
    assert.equal(component.postRequisites[3].isSelected, false);

    await component.removeSelectedPostrequisite();
    assert.equal(component.selectedPostrequisiteTitle, 'None');
    assert.equal(component.postRequisites[0].isSelected, false);
    assert.equal(component.postRequisites[1].isSelected, false);
    assert.equal(component.postRequisites[2].isSelected, false);
    assert.equal(component.postRequisites[3].isSelected, false);
  });

  test('can remove postrequisite from row', async function (assert) {
    const sessions = this.server.createList('session', 4);
    const course = this.server.create('course', {
      sessions
    });
    const session = this.server.create('session', {
      postrequisite: sessions[1],
      course
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('nothing', () => {});
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{this.nothing}}
     @session={{this.session}}
    />`);
    assert.equal(component.selectedPostrequisiteTitle, 'session 1');
    assert.equal(component.postRequisites.length, 4);
    assert.equal(component.postRequisites[0].isSelected, false);
    assert.equal(component.postRequisites[1].isSelected, true);
    assert.equal(component.postRequisites[2].isSelected, false);
    assert.equal(component.postRequisites[3].isSelected, false);

    await component.postRequisites[1].click();
    assert.equal(component.selectedPostrequisiteTitle, 'None');
    assert.equal(component.postRequisites[0].isSelected, false);
    assert.equal(component.postRequisites[1].isSelected, false);
    assert.equal(component.postRequisites[2].isSelected, false);
    assert.equal(component.postRequisites[3].isSelected, false);
  });

  test('can add postrequisite from row', async function (assert) {
    const sessions = this.server.createList('session', 5);
    this.server.create('course', {
      sessions
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', sessions[0].id);
    this.set('nothing', () => {});
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{this.nothing}}
     @session={{this.session}}
    />`);
    assert.equal(component.selectedPostrequisiteTitle, 'None');
    assert.equal(component.postRequisites.length, 4);
    assert.equal(component.postRequisites[0].isSelected, false);
    assert.equal(component.postRequisites[1].isSelected, false);
    assert.equal(component.postRequisites[2].isSelected, false);
    assert.equal(component.postRequisites[3].isSelected, false);

    await component.postRequisites[1].click();
    assert.equal(component.selectedPostrequisiteTitle, 'session 2');
    assert.equal(component.postRequisites[0].isSelected, false);
    assert.equal(component.postRequisites[1].isSelected, true);
    assert.equal(component.postRequisites[2].isSelected, false);
    assert.equal(component.postRequisites[3].isSelected, false);
  });

  test('closes when canceled', async function (assert) {
    assert.expect(1);
    const sessions = this.server.createList('session', 5);
    this.server.create('course', {
      sessions
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', sessions[0].id);
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
      sessions
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', sessions[0].id);
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
      course
    });
    this.server.create('session', {
      title: 'jasper dog',
      course
    });
    this.server.create('session', {
      title: 'jackson dog',
      course
    });
    this.server.create('session', {
      title: 'fuzzy the cat',
      course
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('nothing', () => {});
    this.set('session', sessionModel);

    await render(hbs`<Session::PostrequisiteEditor
     @close={{this.nothing}}
     @session={{this.session}}
    />`);
    assert.equal(component.postRequisites.length, 3);
    assert.equal(component.postRequisites[0].title, 'fuzzy the cat');
    assert.equal(component.postRequisites[1].title, 'jackson dog');
    assert.equal(component.postRequisites[2].title, 'jasper dog');
    await component.filterBy('dog');
    assert.equal(component.postRequisites.length, 2);
    assert.equal(component.postRequisites[0].title, 'jackson dog');
    assert.equal(component.postRequisites[1].title, 'jasper dog');

    await component.filterBy('cat');
    assert.equal(component.postRequisites.length, 1);
    assert.equal(component.postRequisites[0].title, 'fuzzy the cat');

    await component.filterBy('jasper');
    assert.equal(component.postRequisites.length, 1);
    assert.equal(component.postRequisites[0].title, 'jasper dog');
  });
});
