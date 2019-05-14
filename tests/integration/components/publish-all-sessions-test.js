import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';

module('Integration | Component | publish all sessions', function(hooks) {
  setupRenderingTest(hooks);

  const parent = EmberObject.create();
  const objective1 = EmberObject.create({ parents: [parent] });
  const objective2 = EmberObject.create({ parents: [] });
  const course = EmberObject.create({
    objectives: [objective1, objective2]
  });
  const unpublishableSession = EmberObject.create({
    id: 1,
    title: 'session 1',
    requiredPublicationIssues: EmberObject.create({
      length: 1
    }),
    optionalPublicationIssues: EmberObject.create({
      length: 1
    }),
    published: false,
    course
  });
  const completeSession = EmberObject.create({
    id: 2,
    title: 'session 2',
    requiredPublicationIssues: EmberObject.create({
      length: 0
    }),
    optionalPublicationIssues: EmberObject.create({
      length: 0
    }),
    allPublicationIssuesLength: 0,
    published: true
  });
  const publishableSession = EmberObject.create({
    id: 3,
    title: 'session 3',
    requiredPublicationIssues: EmberObject.create({
      length: 0
    }),
    optionalPublicationIssues: EmberObject.create({
      length: 1
    }),
    published: false
  });

  test('it renders', async function(assert) {
    assert.expect(4);

    let sessions = [unpublishableSession, completeSession, publishableSession];
    this.set('sessions', resolve(sessions));

    await render(hbs`{{publish-all-sessions sessions=sessions}}`);
    await settled();

    assert.ok(this.element.textContent.search(/Sessions Incomplete: cannot publish \(1\)/) !== -1);
    assert.ok(this.element.textContent.search(/Sessions Complete: ready to publish \(1\)/) !== -1);
    assert.ok(this.element.textContent.search(/Sessions Requiring Review \(1\)/) !== -1);
    assert.ok(this.element.textContent.search(/Publish 1, schedule 1, and ignore 1 sessions/) !== -1);
  });

  test('it renders empty', async function(assert) {
    assert.expect(5);
    let sessions = [];
    this.set('sessions', resolve(sessions));

    const reviewButtons = '.publish-all-sessions-overridable button';
    const reviewTable = '.publish-all-sessions-overridable table';

    await render(hbs`{{publish-all-sessions sessions=sessions}}`);
    await settled();

    assert.ok(this.element.textContent.search(/Sessions Incomplete: cannot publish \(0\)/) !== -1);
    assert.ok(this.element.textContent.search(/Sessions Complete: ready to publish \(0\)/) !== -1);
    assert.ok(this.element.textContent.search(/Sessions Requiring Review \(0\)/) !== -1);
    assert.dom(reviewButtons).doesNotExist(
      'If there are no reviewable sessions do not display buttons to act on them #1173'
    );
    assert.dom(reviewTable).doesNotExist(
      'If there are no reviewable sessions do not display a table to list them #1173'
    );
  });

  test('shows course objective warning', async function(assert) {
    assert.expect(3);

    const sessions = [unpublishableSession];
    this.set('sessions', sessions);
    await render(hbs`{{publish-all-sessions sessions=sessions}}`);
    await settled();
    assert.dom('[data-test-unlinked-warning]').hasText('This course has unlinked objective(s)');
    assert.ok(!!find('.fa-unlink'));
    assert.ok(!!find('.fa-chart-bar'));
  });
});
