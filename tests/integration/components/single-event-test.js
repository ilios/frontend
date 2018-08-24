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

  hooks.beforeEach(function () {
    this.server.logging = true;
    const now = moment().hour(8).minute(0).second(0);
    const course = this.server.create('course', {
      id: 1,
      title: 'test course',
    });
    this.server.create('session', {
      id: 1,
      title: 'test session',
      course
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
    this.ourEvent = EmberObject.create({
      user: 1,
      courseExternalId: 'ext1',
      sessionTypeTitle: 'test type',
      sessionDescription: 'test description',
      name: 'test session',
      courseTitle: 'test course',
      startDate: now,
      endDate: now.clone().add(1, 'hour'),
      location: 'here',
      instructors: ['Great Teacher'],
      session: 1,
      learningMaterials: this.sessionLearningMaterials,
      sessionObjectives: [
        {
          id: 1,
          title: 'Session Objective A',
          position: 2,
          competencies: [2]
        },
        {
          id: 2,
          title: 'Session Objective B',
          position: 0,
          competencies: [2]
        },
        {
          id: 3,
          title: 'Session Objective C',
          position: 0,
          competencies: [3]
        }
      ],
      courseObjectives: [
        {
          id: 4,
          title: 'Course Objective A',
          position: 0,
          competencies: [1]
        },
        {
          id: 5,
          title: 'Course Objective B',
          position: 0,
          competencies: [1]
        },
        {
          id: 6,
          title: 'Course Objective C',
          position: 0,
          competencies: [3]
        }
      ],
      competencies: [
        {
          id: 1,
          title: 'Domain A',
          parent: null
        },
        {
          id: 2,
          title: 'Competency A',
          parent: 1,
        },
        {
          id: 3,
          title: 'Domain B',
          parent: null
        }
      ],
    });
  });

  test('it renders', async function(assert) {
    assert.expect(20);
    this.set('event', this.ourEvent);
    await render(hbs`{{single-event event=event}}`);
    await settled();

    assert.ok(this.element.querySelector('.single-event-summary').textContent.includes('test course'), 'course title is displayed');
    assert.ok(this.element.querySelector('.single-event-summary').textContent.includes('test session'), 'session title is displayed');
    assert.ok(this.element.querySelector('.single-event-location').textContent.includes('here'), 'location is displayed');
    assert.ok(this.element.querySelector('.single-event-instructors').textContent.includes('Taught By Great Teacher'), 'instructors are displayed');
    assert.ok(this.element.querySelector('.single-event-session-is').textContent.includes('This session is "test type"'), 'session type is displayed');
    assert.ok(this.element.querySelector('.single-event-summary').textContent.includes('test description'), 'session description is displayed');
    let $sessionLm = this.$('.single-event-learningmaterial-list:nth-of-type(1) .single-event-learningmaterial-item:nth-of-type(1)');
    assert.dom(
      this.element.querySelector('.single-event-learningmaterial-item-notes', $sessionLm)
    ).hasText(this.sessionLearningMaterials[0].publicNotes);
    assert.dom(
      this.element.querySelector('.single-event-learningmaterial-item-description', $sessionLm)
    ).hasText(this.sessionLearningMaterials[0].description);
    assert.ok(this.element.querySelector('.single-event-learningmaterial-item-title', $sessionLm).textContent.includes(this.sessionLearningMaterials[0].title));
    $sessionLm = this.$('.single-event-learningmaterial-list:nth-of-type(1) .single-event-learningmaterial-item:nth-of-type(2)');
    assert.equal(this.element.querySelectorAll('.lm-type-icon .fa-clock', $sessionLm).length, 1, 'Timed release icon is visible');
    assert.ok(this.element.querySelector('.single-event-learningmaterial-item-title', $sessionLm).textContent.includes(this.sessionLearningMaterials[0].title));
    let sessionObjectivesSelector = '.single-event-objective-list > .single-event-objective-list:eq(0)';
    assert.ok(this.$(`${sessionObjectivesSelector} ul.tree > li:eq(0)`).text().trim().startsWith('Competency A (Domain A)'));
    assert.equal(this.$(`${sessionObjectivesSelector} ul.tree > li:eq(0) li:eq(0)`).text().trim(), 'Session Objective B');
    assert.equal(this.$(`${sessionObjectivesSelector} ul.tree > li:eq(0) li:eq(1)`).text().trim(), 'Session Objective A');
    assert.ok(this.$(`${sessionObjectivesSelector} ul.tree > li:eq(1)`).text().trim().startsWith('Domain B (Domain B)'));
    assert.equal(this.$(`${sessionObjectivesSelector} ul.tree > li:eq(1) li:eq(0)`).text().trim(), 'Session Objective C');

    let courseObjectivesSelector = '.single-event-objective-list > .single-event-objective-list:eq(1)';
    assert.ok(this.$(`${courseObjectivesSelector} ul.tree > li:eq(0)`).text().trim().startsWith('Domain A (Domain A)'));
    assert.equal(this.$(`${courseObjectivesSelector} ul.tree > li:eq(0) li:eq(0)`).text().trim(), 'Course Objective B');
    assert.equal(this.$(`${courseObjectivesSelector} ul.tree > li:eq(0) li:eq(1)`).text().trim(), 'Course Objective A');
    assert.ok(this.$(`${courseObjectivesSelector} ul.tree > li:eq(1)`).text().trim().startsWith('Domain B (Domain B)'));
  });
});
