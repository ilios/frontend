import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/single-event';

module('Integration | Component | ilios calendar single event', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.owner.setupRouter();
  });

  test('it renders', async function(assert) {
    assert.expect(22);

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
      {
        title: 'Lecture Notes',
        sessionLearningMaterial: '1',
        description: 'Lecture Notes in PDF format',
        absoluteFileUri: 'http://example.edu/notes.pdf',
        mimetype: 'application/pdf',
        filesize: 1000,
        required: true,
        publicNotes: 'Lorem Ipsum',
        position: 0,
      },
      {
        title: 'Mystery Meat',
        sessionLearningMaterial: '2',
        position: 1,
        isBlanked: true,
        endDate: new Date('2013-03-01T01:10:00')
      }
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
    await render(hbs`<SingleEvent @event={{event}} />`);

    assert.dom('.single-event-summary').containsText('test course', 'course title is displayed');
    assert.dom('.single-event-summary').containsText('test session', 'session title is displayed');
    assert.dom('.single-event-location').containsText('here', 'location is displayed');
    assert.dom('.single-event-instructors').containsText('Taught By Great Teacher', 'instructors are displayed');
    assert.dom('.single-event-session-is').containsText('Session Type: test type', 'session type is displayed');
    assert.dom('.single-event-summary').containsText('test description', 'session description is displayed');

    const firstSessionLm = '.single-event-learningmaterial-list:nth-of-type(1) .single-event-learningmaterial-item:nth-of-type(1)';
    console.log(find(firstSessionLm));
    assert.dom(`${firstSessionLm} .lm-type-icon .fa-file-pdf`).exists('PDF file type icon is visible');
    assert.dom(`${firstSessionLm} .single-event-learningmaterial-item-notes`).hasText(learningMaterials[0].publicNotes);
    assert.dom(`${firstSessionLm} .single-event-learningmaterial-item-description`).hasText(learningMaterials[0].description);
    assert.dom(`${firstSessionLm} .single-event-learningmaterial-item-title`).containsText(learningMaterials[0].title);

    const secondSessionLm = '.single-event-learningmaterial-list:nth-of-type(1) .single-event-learningmaterial-item:nth-of-type(2)';
    assert.dom(`${secondSessionLm} .lm-type-icon .fa-clock`).exists('Timed release icon is visible');
    assert.dom(`${secondSessionLm} .single-event-learningmaterial-item-title`).containsText(learningMaterials[1].title);

    const sessionObjectivesSelector = '.single-event-objective-list > .single-event-objective-list:nth-of-type(1)';
    assert.dom(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(1)`).containsText('Competency A (Domain A)');
    assert.dom(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(1) li:nth-of-type(1)`).hasText('Session Objective B');
    assert.dom(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(1) li:nth-of-type(2)`).hasText('Session Objective A');
    assert.dom(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(2)`).containsText('Domain B (Domain B)');
    assert.dom(`${sessionObjectivesSelector} ul.tree > li:nth-of-type(2) li:nth-of-type(1)`).hasText('Session Objective C');

    const courseObjectivesSelector = '[data-test-course-objectives]';
    assert.dom(`${courseObjectivesSelector} ul.tree > li:nth-of-type(1)`).containsText('Domain A (Domain A)');
    assert.dom(`${courseObjectivesSelector} ul.tree > li:nth-of-type(1) li:nth-of-type(1)`).hasText('Course Objective B');
    assert.dom(`${courseObjectivesSelector} ul.tree > li:nth-of-type(1) li:nth-of-type(2)`).hasText('Course Objective A');
    assert.dom(`${courseObjectivesSelector} ul.tree > li:nth-of-type(2)`).containsText('Domain B (Domain B)');
    assert.dom(`${courseObjectivesSelector} ul.tree > li:nth-of-type(2) li:nth-of-type(1)`).hasText('Course Objective C');
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
    await render(hbs`<SingleEvent @event={{event}} />`);
    assert.equal(component.title, 'course - Learn to Learn');
    assert.equal(component.offeredAt, today.format('dddd, MMMM Do YYYY, h:mm a'));
  });

  test('postrequisite date and title are displayed', async function(assert) {
    assert.expect(3);

    const today = moment().hour(8).minute(0).second(0);
    const tomorrow = today.clone().add(1, 'day');
    const postReq = {
      name: 'postrequisite session',
      courseTitle: 'course',
      startDate: tomorrow.format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      slug: '1234'
    };
    this.server.create('userevent', {
      name: 'Learn to Learn',
      courseTitle: 'course',
      startDate: today.format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      ilmSession: 1,
      lastModified: null,
      postrequisites: [postReq]
    });

    this.set('event', this.server.db.userevents[0]);
    await render(hbs`<SingleEvent @event={{event}} />`);
    assert.equal(component.title, 'course - Learn to Learn');
    const formatedDate = tomorrow.format('dddd, MMMM Do YYYY, h:mm a');
    assert.equal(component.offeredAt, `Due Before postrequisite session (${formatedDate})`);
    assert.equal(component.offeredAtLink, `/events/1234`);
  });

  test('prequisites are displayed', async function(assert) {
    assert.expect(6);

    const today = moment().hour(8).minute(0).second(0);
    const prereq1 = {
      name: 'prework 1',
      startDate: today.clone().subtract(1, 'day').format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
    };
    const prereq2 = {
      name: 'prework 2',
      startDate: today.clone().subtract(3, 'days').format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
    };
    this.server.create('userevent', {
      name: 'Learn to Learn',
      courseTitle: 'course',
      startDate: today.format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      offering: 1,
      lastModified: null,
      prerequisites: [prereq1, prereq2]
    });

    this.set('event', this.server.db.userevents[0]);
    await render(hbs`<SingleEvent @event={{event}} />`);
    assert.equal(component.title, 'course - Learn to Learn');
    assert.equal(component.preWork.length, 2);
    assert.equal(component.preWork[0].title, 'prework 1');
    assert.ok(component.preWork[0].hasLink);
    assert.equal(component.preWork[1].title, 'prework 2');
    assert.ok(component.preWork[1].hasLink);
  });

  test('for non ilms postrequisite date and title are displayed along with offering date', async function(assert) {
    assert.expect(3);
    this.owner.setupRouter();

    const today = moment().hour(8).minute(0).second(0);
    const tomorrow = today.clone().add(1, 'day');
    const postReq = {
      name: 'postrequisite session',
      courseTitle: 'course',
      startDate: tomorrow.format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      slug: '1234'
    };
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
    await render(hbs`<SingleEvent @event={{event}} />`);
    assert.equal(component.title, 'course - Learn to Learn');
    const formattedTomorrow = tomorrow.format('dddd, MMMM Do YYYY, h:mm a');
    const formattedToday = today.format('dddd, MMMM Do YYYY, h:mm a');
    assert.equal(component.offeredAt, `Due Before postrequisite session (${formattedTomorrow}) ${formattedToday}`);
    assert.equal(component.offeredAtLink, `/events/1234`);
  });
});
