import RSVP from 'rsvp';
import Service from '@ember/service';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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
        mimetype: 'application/pdf'
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
});
let blankEventsMock = Service.extend({
  getEvents(){
    return new resolve([]);
  }
});

module('Integration | Component | dashboard week', function(hooks) {
  setupRenderingTest(hooks);

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
    assert.expect(25);
    this.owner.register('service:user-events', userEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    await render(hbs`{{dashboard-week}}`);
    const title = 'h3';
    const allWeeks = '.weeklylink a';
    const events = '.event';
    const firstEvent = `${events}:nth-of-type(1)`;
    const secondEvent = `${events}:nth-of-type(2)`;

    const firstEventTitle = `${firstEvent} .title`;
    const firstSessionType = `${firstEvent} .sessiontype`;
    const firstLocation = `${firstEvent} .location`;
    const firstDescription = `${firstEvent} .description`;
    const firstLearningMaterials = `${firstEvent} .learning-material`;
    const firstLm1 = `${firstLearningMaterials}:nth-of-type(1)`;
    const firstLm1TypeIcon = `${firstLm1} .fa-paragraph`;
    const firstLm2 = `${firstLearningMaterials}:nth-of-type(2)`;
    const firstLm2Link = `${firstLm2} a`;
    const firstLm2TypeIcon = `${firstLm2} .fa-link`;
    const firstLm3 = `${firstLearningMaterials}:nth-of-type(3)`;
    const firstLm3Link = `${firstLm3} a:nth-of-type(1)`;
    const firstLm3DownloadLink = `${firstLm3} a:nth-of-type(2)`;

    const firstLm3TypeIcon = `${firstLm3} .fa-file-pdf`;

    const firstInstructors = `${firstEvent} .instructors`;

    const secondEventTitle = `${secondEvent} .title`;
    const secondSessionType = `${secondEvent} .sessiontype`;
    const secondLocation = `${secondEvent} .location`;
    const secondDescription = `${secondEvent} .description`;
    const secondLearningMaterials = `${secondEvent} .learning-material`;
    const secondLm1 = `${secondLearningMaterials}:nth-of-type(1)`;
    const secondLm1Link = `${secondLm1} a`;
    const secondLm1TypeIcon = `${secondLm1} .fa-file-powerpoint`;

    const secondInstructors = `${secondEvent} .instructors`;


    await settled();

    const expectedTitle = getTitle();
    assert.equal(this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
    assert.dom(this.element.querySelector(allWeeks)).hasText('Last Week / Next Week / All Weeks');
    assert.equal(this.element.querySelectorAll(events).length, 2, 'Blank events are not shown');

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
    assert.equal(this.$(firstLm3Link).attr('href'), 'http://myhost.com/url1?inline');
    assert.equal(this.$(firstLm3DownloadLink).attr('href'), 'http://myhost.com/url1');
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
    this.owner.register('service:user-events', blankEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    await render(hbs`{{dashboard-week}}`);
    const title = 'h3';
    const body = 'p';
    const expectedTitle = getTitle();

    await settled();

    assert.equal(this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
    assert.dom(this.element.querySelector(body)).hasText('None');

  });
});
