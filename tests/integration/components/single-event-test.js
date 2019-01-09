import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios-common/page-objects/components/single-event';

module('Integration | Component | ilios calendar single event', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(20);

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

    const learningMaterials = [
      EmberObject.create({
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
      EmberObject.create({
        title: 'Mystery Meat',
        sessionLearningMaterial: '2',
        position: 1,
        isBlanked: true,
        endDate: new Date('2013-03-01T01:10:00')
      })
    ];
    const ourEvent = this.server.create('userevent', {
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
      learningMaterials,
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

    this.set('event', ourEvent);
    await render(hbs`{{single-event event=event}}`);

    assert.ok(this.element.querySelector('.single-event-summary').textContent.includes('test course'), 'course title is displayed');
    assert.ok(this.element.querySelector('.single-event-summary').textContent.includes('test session'), 'session title is displayed');
    assert.ok(this.element.querySelector('.single-event-location').textContent.includes('here'), 'location is displayed');
    assert.ok(this.element.querySelector('.single-event-instructors').textContent.includes('Taught By Great Teacher'), 'instructors are displayed');
    assert.ok(this.element.querySelector('.single-event-session-is').textContent.includes('This session is "test type"'), 'session type is displayed');
    assert.ok(this.element.querySelector('.single-event-summary').textContent.includes('test description'), 'session description is displayed');
    let sessionLm = this.element.querySelector('.single-event-learningmaterial-list:nth-of-type(1) .single-event-learningmaterial-item:nth-of-type(1)');
    assert.dom(
      this.element.querySelector('.single-event-learningmaterial-item-notes', sessionLm)
    ).hasText(learningMaterials[0].publicNotes);
    assert.dom(
      this.element.querySelector('.single-event-learningmaterial-item-description', sessionLm)
    ).hasText(learningMaterials[0].description);
    assert.ok(this.element.querySelector('.single-event-learningmaterial-item-title', sessionLm).textContent.includes(learningMaterials[0].title));
    sessionLm = this.element.querySelector('.single-event-learningmaterial-list:nth-of-type(1) .single-event-learningmaterial-item:nth-of-type(2)');
    assert.equal(this.element.querySelectorAll('.lm-type-icon .fa-clock', sessionLm).length, 1, 'Timed release icon is visible');
    assert.ok(this.element.querySelector('.single-event-learningmaterial-item-title', sessionLm).textContent.includes(learningMaterials[0].title));
    let sessionObjectivesSelector = '.single-event-objective-list > .single-event-objective-list:nth-of-type(1)';
    assert.ok(this.element.querySelector(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(1)`).textContent.trim().startsWith('Competency A (Domain A)'));
    assert.dom(
      this.element.querySelector(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(1) li:nth-of-type(1)`)
    ).hasText('Session Objective B');
    assert.dom(
      this.element.querySelector(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(1) li:nth-of-type(2)`)
    ).hasText('Session Objective A');
    assert.ok(this.element.querySelector(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(2)`).textContent.trim().startsWith('Domain B (Domain B)'));
    assert.dom(
      this.element.querySelector(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(2) li:nth-of-type(1)`)
    ).hasText('Session Objective C');

    let courseObjectivesSelector = '[data-test-course-objectives]';
    assert.ok(this.element.querySelector(`${courseObjectivesSelector} ul.tree > li:nth-of-type(1)`).textContent.trim().startsWith('Domain A (Domain A)'));
    assert.dom(
      this.element.querySelector(`${courseObjectivesSelector} ul.tree > li:nth-of-type(1) li:nth-of-type(1)`)
    ).hasText('Course Objective B');
    assert.dom(
      this.element.querySelector(`${courseObjectivesSelector} ul.tree > li:nth-of-type(1) li:nth-of-type(2)`)
    ).hasText('Course Objective A');
    assert.ok(this.element.querySelector(`${courseObjectivesSelector} ul.tree > li:nth-of-type(2)`).textContent.trim().startsWith('Domain B (Domain B)'));
  });

  test('unlinked event date and title are displayed', async function(assert) {
    assert.expect(2);

    const today = moment().hour(8).minute(0).second(0);
    this.server.create('userevent', {
      name: 'Learn to Learn',
      courseTitle: 'course',
      startDate: today.format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      offering: 1,
      lastModified: null,
    });

    this.set('event', this.server.db.userevents[0]);
    await render(hbs`{{single-event event=event}}`);
    assert.equal(component.title, 'course - Learn to Learn');
    assert.equal(component.offeredAt, 'On ' + today.format('dddd, MMMM Do YYYY, h:mm a'));
  });

  test('postrequisite date and title are displayed', async function(assert) {
    assert.expect(2);

    const today = moment().hour(8).minute(0).second(0);
    const tomorrow = today.clone().add(1, 'day');
    const postReq = EmberObject.create({
      name: 'postrequisite session',
      courseTitle: 'course',
      startDate: tomorrow.format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
    });
    this.server.create('userevent', {
      name: 'Learn to Learn',
      courseTitle: 'course',
      startDate: today.format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      offering: 1,
      lastModified: null,
      postrequisites: [postReq]
    });

    this.set('event', this.server.db.userevents[0]);
    await render(hbs`{{single-event event=event}}`);
    assert.equal(component.title, 'course - Learn to Learn');
    const formatedDate = tomorrow.format('dddd, MMMM Do YYYY, h:mm a');
    assert.equal(component.offeredAt, `Due Before postrequisite session (${formatedDate})`);
  });
});
