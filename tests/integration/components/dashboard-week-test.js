import moment from 'moment';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Service, Object:EmberObject } = Ember;
const { resolve } = RSVP;

let today = moment();

const mockEvents = [
  {
    name: 'Learn to Learn',
    startDate: today.format(),
    location: 'Room 123',
    sessionTypeTitle: 'Lecture',
    courseExternalId: 'C1',
    sessionDescription: 'Best <strong>Session</strong> For Sure',
    isBlanked: false,
    isPublished: true,
    isScheduled: false,
    learningMaterials: [
      {
        title: 'Citation LM',
        required: true,
        publicNote: 'This is cool.',
        citation: 'citationtext',
        type: 'citation'
      },
      {
        title: 'Link LM',
        required: false,
        link: 'http://myhost.com/url2',
        type: 'link'
      },
      {
        title: 'File LM',
        required: true,
        absoluteFileUri: 'http://myhost.com/url1',
        type: 'file',
        mimetype: 'pdf'
      },
    ],
  },
  {
    name: 'Finding the Point in Life',
    startDate: today.format(),
    location: 'Room 456',
    sessionTypeTitle: 'Independent Learning',
    isBlanked: false,
    isPublished: true,
    isScheduled: false,
    learningMaterials: [
      {
        title: 'Great Slides',
        required: true,
        absoluteFileUri: 'http://myhost.com/url1',
        type: 'file',
        mimetype: 'keynote'
      },
    ],
    instructors: [
      'Second Person',
      'First Person',
    ],
  },
  {
    name: 'Blank',
    isBlanked: true,
  },
  {
    name: 'Not Published',
    isBlanked: false,
    isPublished: false,
    isScheduled: false,
  },
  {
    name: 'Scheduled',
    isBlanked: false,
    isPublished: true,
    isScheduled: true,
  },
];
const userEventsMock = Service.extend({
  getEvents(){
    return new resolve(mockEvents);
  },
  getSessionForEvent() {
    return EmberObject.create({
      attireRequired: false,
      equipmentRequired: false,
      attendanceRequired: false,
    });
  }
});
let blankEventsMock = Service.extend({
  getEvents(){
    return new resolve([]);
  }
});

moduleForComponent('dashboard-week', 'Integration | Component | dashboard week', {
  integration: true,
});

const getTitle = function(){
  const startOfWeek = today.clone().day(0).hour(0).minute(0).second(0);
  const endOfWeek = today.clone().day(6).hour(23).minute(59).second(59);

  let expectedTitle;
  if (startOfWeek.month() != endOfWeek.month()) {
    const from = startOfWeek.format('MMMM D');
    const to = endOfWeek.format('MMMM D');
    expectedTitle = `${from} - ${to}`;
  } else {
    const from = startOfWeek.format('MMMM D');
    const to = endOfWeek.format('D');
    expectedTitle = `${from}-${to}`;
  }
  expectedTitle += ' Week at a Glance';

  return expectedTitle;
};

test('it renders with events', async function(assert) {
  assert.expect(24);
  this.register('service:user-events', userEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.render(hbs`{{dashboard-week}}`);
  const title = 'h3';
  const allWeeks = '.weeklylink a';
  const events = '.event';
  const firstEvent = `${events}:eq(0)`;
  const secondEvent = `${events}:eq(1)`;

  const firstEventTitle = `${firstEvent} .title`;
  const firstSessionType = `${firstEvent} .sessiontype`;
  const firstLocation = `${firstEvent} .location`;
  const firstDescription = `${firstEvent} .description`;
  const firstLearningMaterials = `${firstEvent} .learning-material`;
  const firstLm1 = `${firstLearningMaterials}:eq(0)`;
  const firstLm1TypeIcon = `${firstLm1} i.fa-paragraph`;
  const firstLm2 = `${firstLearningMaterials}:eq(1)`;
  const firstLm2Link = `${firstLm2} a`;
  const firstLm2TypeIcon = `${firstLm2} i.fa-link`;
  const firstLm3 = `${firstLearningMaterials}:eq(2)`;
  const firstLm3Link = `${firstLm3} a`;
  const firstLm3TypeIcon = `${firstLm3} i.fa-file-pdf-o`;

  const firstInstructors = `${firstEvent} .instructors`;

  const secondEventTitle = `${secondEvent} .title`;
  const secondSessionType = `${secondEvent} .sessiontype`;
  const secondLocation = `${secondEvent} .location`;
  const secondDescription = `${secondEvent} .description`;
  const secondLearningMaterials = `${secondEvent} .learning-material`;
  const secondLm1 = `${secondLearningMaterials}:eq(0)`;
  const secondLm1Link = `${secondLm1} a`;
  const secondLm1TypeIcon = `${secondLm1} i.fa-file-powerpoint-o`;

  const secondInstructors = `${secondEvent} .instructors`;


  await wait();

  const expectedTitle = getTitle();
  assert.equal(this.$(title).text().replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
  assert.equal(this.$(allWeeks).text().trim(), 'Last Week / Next Week / All Weeks');
  assert.equal(this.$(events).length, 2, 'Blank events are not shown');

  assert.equal(this.$(firstEventTitle).text().trim(), 'Learn to Learn');
  assert.equal(this.$(firstSessionType).text().trim(), 'Lecture');
  assert.equal(this.$(firstLocation).text().trim(), '- Room 123');
  assert.equal(this.$(firstDescription).text().trim(), 'Best Session For Sure');
  assert.equal(this.$(firstLm1).text().replace(/[\t\n\s]+/g, ""), 'CitationLMcitationtext');
  assert.equal(this.$(firstLm1TypeIcon).length, 1, 'LM type icon is present');
  assert.equal(this.$(firstLm2).text().trim(), 'Link LM');
  assert.equal(this.$(firstLm2Link).attr('href'), 'http://myhost.com/url2');
  assert.equal(this.$(firstLm2TypeIcon).length, 1, 'LM type icon is present');
  assert.equal(this.$(firstLm3).text().trim(), 'File LM');
  assert.equal(this.$(firstLm3Link).attr('href'), 'http://myhost.com/url1');
  assert.equal(this.$(firstLm3TypeIcon).length, 1, 'LM type icon is present');
  assert.equal(this.$(firstInstructors).length, 0, 'No Instructors leaves and empty spot');

  assert.equal(this.$(secondEventTitle).text().trim(), 'Finding the Point in Life');
  assert.equal(this.$(secondSessionType).text().trim(), 'Independent Learning');
  assert.equal(this.$(secondLocation).text().trim(), '- Room 456');
  assert.equal(this.$(secondDescription).text().trim(), '', 'Emtpy Description is Empty');
  assert.equal(this.$(secondLm1).text().trim(), 'Great Slides');
  assert.equal(this.$(secondLm1Link).attr('href'), 'http://myhost.com/url1');
  assert.equal(this.$(secondLm1TypeIcon).length, 1, 'LM type icon is present');
  assert.equal(this.$(secondInstructors).text().replace(/[\t\n\s]+/g, ""), 'Instructors:FirstPerson,SecondPerson', 'Instructors sorted and formated correctly');
});

test('it renders blank', async function(assert) {
  assert.expect(2);
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.render(hbs`{{dashboard-week}}`);
  const title = 'h3';
  const body = 'p';
  const expectedTitle = getTitle();

  await wait();

  assert.equal(this.$(title).text().replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
  assert.equal(this.$(body).text().trim(), 'None');

});
