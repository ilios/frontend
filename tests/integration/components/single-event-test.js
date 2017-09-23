import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import moment from 'moment';
import wait from 'ember-test-helpers/wait';

const { Object: EmberObject, RSVP, Service } = Ember;
const { Promise, resolve } = RSVP;

let ourEvent;
let course;
let session;
let sessionType;
let sessionDescription;
let offering;
let storeMock;
let sessionLearningMaterials;
moduleForComponent('single-event', 'Integration | Component | ilios calendar single event', {
  integration: true,
  beforeEach() {
    window.Promise = Promise;
    const now = moment().hour(8).minute(0).second(0);
    course = EmberObject.create({
      id: 1,
      title: 'test course',
      sortedObjectives: resolve([]),
    });
    sessionType = EmberObject.create({
      id: 1,
      title: 'test type',
    });
    sessionDescription = EmberObject.create({
      id: 1,
      description: 'test description',
    });
    session = EmberObject.create({
      id: 1,
      title: 'test session',
      course: resolve(course),
      sessionType: resolve(sessionType),
      sessionDescription: resolve(sessionDescription),
      sortedObjectives: resolve([]),
    });
    sessionLearningMaterials = [
      EmberObject.create({
        title: 'Lecture Notes',
        slm: '1',
        description: 'Lecture Notes in PDF format',
        absoluteFileUri: 'http://example.edu/notes.pdf',
        mimetype: 'application/pdf',
        filesize: 1000,
        required: true,
        publicNotes: 'Lorem Ipsum'
      })
    ];
    offering = EmberObject.create({
      id: 1,
      session: resolve(session),
    });
    ourEvent = EmberObject.create({
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
      learningMaterials: sessionLearningMaterials
    });

    storeMock = Service.extend({
      findRecord(what){
        if (what === 'offering') {
          return resolve(offering);
        }
      },
    });
    this.register('service:store', storeMock);
  }
});

test('it renders', async function(assert) {
  assert.expect(9);
  this.set('event', ourEvent);
  this.render(hbs`{{single-event event=event}}`);
  await wait();

  assert.ok(this.$('.single-event-summary').text().includes('test course'), 'course title is displayed');
  assert.ok(this.$('.single-event-summary').text().includes('test session'), 'session title is displayed');
  assert.ok(this.$('.single-event-location').text().includes('here'), 'location is displayed');
  assert.ok(this.$('.single-event-instructors').text().includes('Taught By Great Teacher'), 'instructors are displayed');
  assert.ok(this.$('.single-event-session-is').text().includes('This session is "test type"'), 'session type is displayed');
  assert.ok(this.$('.single-event-summary').text().includes('test description'), 'session description is displayed');
  const $sessionLm = this.$('.single-event-learningmaterial-list:eq(0) .single-event-learningmaterial-item:eq(0)');
  assert.equal(this.$('.single-event-learningmaterial-item-notes', $sessionLm).text().trim(), sessionLearningMaterials[0].get('publicNotes'));
  assert.equal(this.$('.single-event-learningmaterial-item-description', $sessionLm).text().trim(), sessionLearningMaterials[0].get('description'));
  assert.ok(this.$('.single-event-learningmaterial-item-title', $sessionLm).text().includes(sessionLearningMaterials[0].get('title')));
});
