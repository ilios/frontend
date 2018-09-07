import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | publish all sessions', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);
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
      published: true,
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
      published: false,
    });
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
    assert.equal(findAll(reviewButtons).length, 0, 'If there are no reviewable sessions do not display buttons to act on them #1173');
    assert.equal(findAll(reviewTable).length, 0, 'If there are no reviewable sessions do not display a table to list them #1173');

  });
});
