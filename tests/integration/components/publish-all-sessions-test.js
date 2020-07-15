import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | publish all sessions', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const programYearObjective = this.server.create('programYearObjective');
    const course = this.server.create('course');
    const term = this.server.create('term');
    const meshDescriptor = this.server.create('meshDescriptor');
    this.server.create('courseObjective', { course, programYearObjectives: [ programYearObjective ] });
    this.server.create('courseObjective', { course });
    const unpublishableSession = this.server.create('session', {
      title: 'session 1',
      published: false,
      course,
      meshDescriptors: [ meshDescriptor ],
      terms: [ term ],
    });
    const completeSession = this.server.create('session', {
      title: 'session 2',
      published: true,
      meshDescriptors: [ meshDescriptor ],
      terms: [ term ],
    });
    const publishableSession = this.server.create('session', {
      title: 'session 3',
      published: false,
    });
    this.server.create('offering', { session: publishableSession });
    this.server.create('offering', { session: completeSession });
    this.server.create('sessionObjective', { session: completeSession });
    this.publishableSession = await this.owner.lookup('service:store').find('session', publishableSession.id);
    this.unpublishableSession = await this.owner.lookup('service:store').find('session', unpublishableSession.id);
    this.completeSession = await this.owner.lookup('service:store').find('session', completeSession.id);
    this.course = await this.owner.lookup('service:store').find('course', course.id);
  });

  test('it renders', async function(assert) {
    assert.expect(4);

    const sessions = [this.unpublishableSession, this.completeSession, this.publishableSession];
    this.set('sessions', sessions);
    this.set('course', this.course);

    await render(hbs`<PublishAllSessions @sessions={{this.sessions}} @course={{this.course}} />`);

    assert.ok(this.element.textContent.search(/Sessions Incomplete: cannot publish \(1\)/) !== -1);
    assert.ok(this.element.textContent.search(/Sessions Complete: ready to publish \(1\)/) !== -1);
    assert.ok(this.element.textContent.search(/Sessions Requiring Review \(1\)/) !== -1);
    assert.ok(this.element.textContent.search(/Publish 1, schedule 1, and ignore 1 sessions/) !== -1);
  });

  test('it renders empty', async function(assert) {
    assert.expect(5);

    const reviewButtons = '.publish-all-sessions-overridable button';
    const reviewTable = '.publish-all-sessions-overridable table';
    this.set('course', this.course);

    await render(hbs`<PublishAllSessions @sessions={{array}} @course={{this.course}} />`);

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

    const sessions = [this.unpublishableSession];
    this.set('sessions', sessions);
    this.set('course', this.course);
    await render(hbs`<PublishAllSessions @sessions={{this.sessions}} @course={{this.course}} />`);
    assert.dom('[data-test-unlinked-warning]').hasText('This course has unlinked objective(s)');
    assert.dom('.fa-unlink').exists();
    assert.dom('.fa-chart-bar').exists();
  });
});
