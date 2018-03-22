import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | ilios calendar single event', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const now = moment().hour(8).minute(0).second(0);
    const course = this.server.create('course', {
      id: 1,
      title: 'test course',
    });
    const sessionType = this.server.create('session-type', {
      id: 1,
      title: 'test type',
    });
    const sessionDescription = this.server.create('session-description', {
      id: 1,
      description: 'test description',
    });
    const session = this.server.create('session', {
      id: 1,
      title: 'test session',
      course,
      sessionType,
      sessionDescription,
    });
    this.sessionLearningMaterials = [
      this.server.create('session-learning-material', {
        title: 'Lecture Notes',
        sessionLearningMaterial: '1',
        description: 'Lecture Notes in PDF format',
        absoluteFileUri: 'http://example.edu/notes.pdf',
        mimetype: 'application/pdf',
        filesize: 1000,
        required: true,
        publicNotes: 'Lorem Ipsum',
        position: 0,
      }),
      this.server.create('session-learning-material', {
        title: 'Mystery Meat',
        sessionLearningMaterial: '2',
        position: 1,
        isBlanked: true,
        endDate: new Date('2013-03-01T01:10:00')
      })
    ];
    this.server.create('offering', {
      id: 1,
      session,
    });
    this.ourEvent = EmberObject.create({
      user: 1,
      courseExternalId: 'ext1',
      sessionTypeTitle: 'session type',
      name: 'test event',
      courseTitle: 'test course',
      startDate: now,
      endDate: now.clone().add(1, 'hour'),
      location: 'here',
      instructors: ['Great Teacher'],
      offering: 1,
      learningMaterials: this.sessionLearningMaterials
    });
  });

  test('it renders', async function(assert) {
    assert.expect(11);
    this.set('event', this.ourEvent);
    await render(hbs`{{single-event event=event}}`);
    await settled();

    assert.ok(this.$('.single-event-summary').text().includes('test course'), 'course title is displayed');
    assert.ok(this.$('.single-event-summary').text().includes('test session'), 'session title is displayed');
    assert.ok(this.$('.single-event-location').text().includes('here'), 'location is displayed');
    assert.ok(this.$('.single-event-instructors').text().includes('Taught By Great Teacher'), 'instructors are displayed');
    assert.ok(this.$('.single-event-session-is').text().includes('This session is "test type"'), 'session type is displayed');
    assert.ok(this.$('.single-event-summary').text().includes('test description'), 'session description is displayed');
    let $sessionLm = this.$('.single-event-learningmaterial-list:eq(0) .single-event-learningmaterial-item:eq(0)');
    assert.equal(this.$('.single-event-learningmaterial-item-notes', $sessionLm).text().trim(), this.sessionLearningMaterials[0].publicNotes);
    assert.equal(this.$('.single-event-learningmaterial-item-description', $sessionLm).text().trim(), this.sessionLearningMaterials[0].description);
    assert.ok(this.$('.single-event-learningmaterial-item-title', $sessionLm).text().includes(this.sessionLearningMaterials[0].title));
    $sessionLm = this.$('.single-event-learningmaterial-list:eq(0) .single-event-learningmaterial-item:eq(1)');
    assert.equal(this.$('.lm-type-icon .fa-clock-o', $sessionLm).length, 1, 'Timed release icon is visible');
    assert.ok(this.$('.single-event-learningmaterial-item-title', $sessionLm).text().includes(this.sessionLearningMaterials[0].title));
  });
});
