import moment from 'moment';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import initializer from "ilios/instance-initializers/ember-i18n";
import wait from 'ember-test-helpers/wait';

let today = moment();

const mockEvents = [
  {
    name: 'Learn to Learn',
    startDate: today.format(),
    location: 123,
    sessionTypeTitle: 'Lecture',
    courseExternalId: 'C1',
    sessionDescription: 'Best Session For Sure',
    isBlanked: false,
    isPublished: true,
    isScheduled: false,
    learningMaterials: [
      {
        title: 'Citation LM',
        required: true,
        publicNote: 'This is cool.',
        citation: 'citationtext',
      },
      {
        title: 'Link LM',
        required: false,
        link: 'http://myhost.com/url2',
      },
      {
        title: 'File LM',
        required: true,
        absoluteFileUri: 'http://myhost.com/url1',
      },
    ],
  },
  {
    name: 'Finding the Point in Life',
    startDate: today.format(),
    location: 123,
    sessionTypeTitle: 'Independent Learning',
    isBlanked: false,
    isPublished: true,
    isScheduled: false,
    learningMaterials: [
      {
        title: 'Great Slides',
        required: true,
        absoluteFileUri: 'http://myhost.com/url1',
      },
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
const userEventsMock = Ember.Service.extend({
  getEvents(){
    return new Ember.RSVP.resolve(mockEvents);
  }
});
let blankEventsMock = Ember.Service.extend({
  getEvents(){
    return new Ember.RSVP.resolve([]);
  }
});

moduleForComponent('dashboard-week', 'Integration | Component | dashboard week', {
  integration: true,
  setup(){
    initializer.initialize(this);
  },
});

test('it renders with events', async function(assert) {
  assert.expect(15);
  this.register('service:user-events', userEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.render(hbs`{{dashboard-week}}`);
  const title = 'h3';
  const events = '.event';
  const firstEvent = `${events}:eq(0)`;
  const secondEvent = `${events}:eq(1)`;

  const firstEventTitle = `${firstEvent} .title`;
  const firstSessionType = `${firstEvent} .sessiontype`;
  const firstDescription = `${firstEvent} .description`;
  const firstLearningMaterials = `${firstEvent} .learning-material`;
  const firstLm1 = `${firstLearningMaterials}:eq(0)`;
  const firstLm2 = `${firstLearningMaterials}:eq(1)`;
  const firstLm2Link = `${firstLm2} a`;
  const firstLm3 = `${firstLearningMaterials}:eq(2)`;
  const firstLm3Link = `${firstLm3} a`;

  const secondEventTitle = `${secondEvent} .title`;
  const secondSessionType = `${secondEvent} .sessiontype`;
  const secondDescription = `${secondEvent} .description`;
  const secondLearningMaterials = `${secondEvent} .learning-material`;
  const secondLm1 = `${secondLearningMaterials}:eq(0)`;
  const secondLm1Link = `${secondLm1} a`;


  await wait();
  const today = moment();
  const startOfWeek = today.clone().day(1);
  const endOfWeek = today.clone().day(7);

  let to;
  if (startOfWeek.month() != endOfWeek.month()) {
    to = endOfWeek.format(' MMMM D');
  } else {
    to = endOfWeek.format('D');
  }
  const from = startOfWeek.format('MMMM D');

  const expectedTitle = `${from}-${to} Week at a Glance`;
  assert.equal(this.$(title).text().trim(), expectedTitle);
  assert.equal(this.$(events).length, 2, 'Blank events are not shown');

  assert.equal(this.$(firstEventTitle).text().trim(), 'Learn to Learn');
  assert.equal(this.$(firstSessionType).text().replace(/[\t\n\s]+/g, ""), 'Lecture-C1');
  assert.equal(this.$(firstDescription).text().trim(), 'Best Session For Sure');
  assert.equal(this.$(firstLm1).text().replace(/[\t\n\s]+/g, ""), 'CitationLMcitationtext');
  assert.equal(this.$(firstLm2).text().trim(), 'Link LM');
  assert.equal(this.$(firstLm2Link).attr('href'), 'http://myhost.com/url2');
  assert.equal(this.$(firstLm3).text().trim(), 'File LM');
  assert.equal(this.$(firstLm3Link).attr('href'), 'http://myhost.com/url1');


  assert.equal(this.$(secondEventTitle).text().trim(), 'Finding the Point in Life');
  assert.equal(this.$(secondSessionType).text().trim(), 'Independent Learning');
  assert.equal(this.$(secondDescription).text().trim(), '', 'Emtpy Description is Empty');
  assert.equal(this.$(secondLm1).text().trim(), 'Great Slides');
  assert.equal(this.$(secondLm1Link).attr('href'), 'http://myhost.com/url1');
});

test('it renders blank', async function(assert) {
  assert.expect(2);
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.render(hbs`{{dashboard-week}}`);
  const title = 'h3';
  const body = 'p';

  await wait();

  const today = moment();
  const startOfWeek = today.clone().day(1).format('MMMM D');
  const endOfWeek = today.clone().day(7).format('D');
  const expectedTitle = `${startOfWeek}-${endOfWeek} Week at a Glance`;
  assert.equal(this.$(title).text().trim(), expectedTitle);
  assert.equal(this.$(body).text().trim(), 'None');

});
