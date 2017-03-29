import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('publish-all-sessions', 'Integration | Component | publish all sessions', {
  integration: true,
});

test('it renders', async function(assert) {
  assert.expect(4);
  const unpublishableSession = Object.create({
    id: 1,
    title: 'session 1',
    requiredPublicationIssues: Object.create({
      length: 1
    }),
    optionalPublicationIssues: Object.create({
      length: 1
    }),
    published: false,
  });
  const completeSession = Object.create({
    id: 2,
    title: 'session 2',
    requiredPublicationIssues: Object.create({
      length: 0
    }),
    optionalPublicationIssues: Object.create({
      length: 0
    }),
    allPublicationIssuesLength: 0,
    published: true,
  });
  const publishableSession = Object.create({
    id: 3,
    title: 'session 3',
    requiredPublicationIssues: Object.create({
      length: 0
    }),
    optionalPublicationIssues: Object.create({
      length: 1
    }),
    published: false,
  });
  let sessions = [unpublishableSession, completeSession, publishableSession];
  this.set('sessions', resolve(sessions));

  this.render(hbs`{{publish-all-sessions sessions=sessions}}`);
  await wait();

  assert.ok(this.$().text().search(/Sessions Incomplete: cannot publish \(1\)/) !== -1);
  assert.ok(this.$().text().search(/Sessions Complete: ready to publish \(1\)/) !== -1);
  assert.ok(this.$().text().search(/Sessions Requiring Review \(1\)/) !== -1);
  assert.ok(this.$().text().search(/Publish 1, schedule 1, and ignore 1 sessions/) !== -1);
});

test('it renders empty', async function(assert) {
  assert.expect(5);
  let sessions = [];
  this.set('sessions', resolve(sessions));

  const reviewButtons = '.publish-all-sessions-overridable button';
  const reviewTable = '.publish-all-sessions-overridable table';

  this.render(hbs`{{publish-all-sessions sessions=sessions}}`);
  await wait();

  assert.ok(this.$().text().search(/Sessions Incomplete: cannot publish \(0\)/) !== -1);
  assert.ok(this.$().text().search(/Sessions Complete: ready to publish \(0\)/) !== -1);
  assert.ok(this.$().text().search(/Sessions Requiring Review \(0\)/) !== -1);
  assert.equal(this.$(reviewButtons).length, 0, 'If there are no reviewable sessions do not display buttons to act on them #1173');
  assert.equal(this.$(reviewTable).length, 0, 'If there are no reviewable sessions do not display a table to list them #1173');

});
