import moment from 'moment';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import initializer from "ilios/instance-initializers/ember-i18n";
import wait from 'ember-test-helpers/wait';

const { RSVP } = Ember;
const { resolve } = RSVP;

const today = moment();

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
const userEventsMock = Ember.Service.extend({
  getEvents(){
    return new resolve(mockEvents);
  }
});
const blankEventsMock = Ember.Service.extend({
  getEvents(){
    return new resolve([]);
  }
});

moduleForComponent('week-glance', 'Integration | Component | week glance', {
  integration: true,
  setup(){
    initializer.initialize(this);
  },
});

const getTitle = function(fullTitle){
  const startOfWeek = today.clone().day(1).hour(0).minute(0).second(0);
  const endOfWeek = today.clone().day(7).hour(23).minute(59).second(59);

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
  if (fullTitle) {
    expectedTitle += ' Week at a Glance';
  }

  return expectedTitle;
};

test('it renders with events', async function(assert) {
  assert.expect(19);
  this.register('service:user-events', userEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });
  this.set('today', today);
  this.render(hbs`{{week-glance
    collapsible=false
    collapsed=false
    showFullTitle=true
    year=(moment-format today 'YYYY')
    week=(moment-format today 'W')
  }}`);
  const title = 'h3';
  const events = '.event';
  const firstEvent = `${events}:eq(0)`;
  const secondEvent = `${events}:eq(1)`;

  const firstEventTitle = `${firstEvent} .title`;
  const firstSessionType = `${firstEvent} .sessiontype`;
  const firstLocation = `${firstEvent} .location`;
  const firstDescription = `${firstEvent} .description`;
  const firstLearningMaterials = `${firstEvent} .learning-material`;
  const firstLm1 = `${firstLearningMaterials}:eq(0)`;
  const firstLm2 = `${firstLearningMaterials}:eq(1)`;
  const firstLm2Link = `${firstLm2} a`;
  const firstLm3 = `${firstLearningMaterials}:eq(2)`;
  const firstLm3Link = `${firstLm3} a`;
  const firstInstructors = `${firstEvent} .instructors`;

  const secondEventTitle = `${secondEvent} .title`;
  const secondSessionType = `${secondEvent} .sessiontype`;
  const secondLocation = `${secondEvent} .location`;
  const secondDescription = `${secondEvent} .description`;
  const secondLearningMaterials = `${secondEvent} .learning-material`;
  const secondLm1 = `${secondLearningMaterials}:eq(0)`;
  const secondLm1Link = `${secondLm1} a`;
  const secondInstructors = `${secondEvent} .instructors`;


  await wait();

  const expectedTitle = getTitle(true);
  assert.equal(this.$(title).text().replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
  assert.equal(this.$(events).length, 2, 'Blank events are not shown');

  assert.equal(this.$(firstEventTitle).text().trim(), 'Learn to Learn');
  assert.equal(this.$(firstSessionType).text().trim(), 'Lecture');
  assert.equal(this.$(firstLocation).text().trim(), '- Room 123');
  assert.equal(this.$(firstDescription).text().trim(), 'Best Session For Sure');
  assert.equal(this.$(firstLm1).text().replace(/[\t\n\s]+/g, ""), 'CitationLMcitationtext');
  assert.equal(this.$(firstLm2).text().trim(), 'Link LM');
  assert.equal(this.$(firstLm2Link).attr('href'), 'http://myhost.com/url2');
  assert.equal(this.$(firstLm3).text().trim(), 'File LM');
  assert.equal(this.$(firstLm3Link).attr('href'), 'http://myhost.com/url1');
  assert.equal(this.$(firstInstructors).length, 0, 'No Instructors leaves and empty spot');


  assert.equal(this.$(secondEventTitle).text().trim(), 'Finding the Point in Life');
  assert.equal(this.$(secondSessionType).text().trim(), 'Independent Learning');
  assert.equal(this.$(secondLocation).text().trim(), '- Room 456');
  assert.equal(this.$(secondDescription).text().trim(), '', 'Emtpy Description is Empty');
  assert.equal(this.$(secondLm1).text().trim(), 'Great Slides');
  assert.equal(this.$(secondLm1Link).attr('href'), 'http://myhost.com/url1');
  assert.equal(this.$(secondInstructors).text().replace(/[\t\n\s]+/g, ""), 'Instructors:FirstPerson,SecondPerson', 'Instructors sorted and formated correctly');
});

test('it renders blank', async function(assert) {
  assert.expect(2);
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.set('today', today);
  this.render(hbs`{{week-glance
    collapsible=false
    collapsed=false
    showFullTitle=true
    year=(moment-format today 'YYYY')
    week=(moment-format today 'W')
  }}`);
  const title = 'h3';
  const body = 'p';
  const expectedTitle = getTitle(true);

  await wait();

  assert.equal(this.$(title).text().replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
  assert.equal(this.$(body).text().trim(), 'None');

});

test('renders short title', async function(assert) {
  assert.expect(1);
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.set('today', today);
  this.render(hbs`{{week-glance
    collapsible=false
    collapsed=false
    showFullTitle=false
    year=(moment-format today 'YYYY')
    week=(moment-format today 'W')
  }}`);
  const title = 'h3';
  const expectedTitle = getTitle(false);
  await wait();

  assert.equal(this.$(title).text().replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
});

test('it renders collapsed', async function(assert) {
  assert.expect(2);
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.set('today', today);
  this.render(hbs`{{week-glance
    collapsible=true
    collapsed=true
    showFullTitle=false
    year=(moment-format today 'YYYY')
    week=(moment-format today 'W')
  }}`);
  const title = 'h3';
  const body = 'p';
  const expectedTitle = getTitle(false);

  await wait();

  assert.equal(this.$(title).text().replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
  assert.equal(this.$(body).length, 0);

});

test('click to expend', async function(assert) {
  assert.expect(1);
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.set('today', today);
  this.set('toggle', value => {
    assert.ok(value);
  });
  this.render(hbs`{{week-glance
    collapsible=true
    collapsed=true
    showFullTitle=false
    year=(moment-format today 'YYYY')
    week=(moment-format today 'W')
    toggleCollapsed=(action toggle)
  }}`);
  const title = 'h3';
  await wait();
  this.$(title).click();
});

test('click to collapse', async function(assert) {
  assert.expect(1);
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.set('today', today);
  this.set('toggle', value => {
    assert.notOk(value);
  });
  this.render(hbs`{{week-glance
    collapsible=true
    collapsed=false
    showFullTitle=false
    year=(moment-format today 'YYYY')
    week=(moment-format today 'W')
    toggleCollapsed=(action toggle)
  }}`);
  const title = 'h3';
  await wait();
  this.$(title).click();
});

test('changing passed properties re-renders', async function(assert) {
  assert.expect(10);
  const nextYear = today.clone().add(1, 'year');
  let count = 1;
  const blankEventsMock = Ember.Service.extend({
    getEvents(fromStamp, toStamp){
      const from = moment(fromStamp, 'X');
      const to = moment(toStamp, 'X');
      switch (count) {
      case 1:
        assert.ok(from.isSame(today, 'year'));
        assert.ok(to.isSame(today, 'year'));
        assert.ok(from.isSame(today, 'isoWeek'));
        assert.ok(to.isSame(today, 'isoWeek'));
        break;
      case 2:
        assert.ok(from.isSame(nextYear, 'year'));
        assert.ok(to.isSame(nextYear, 'year'));
        assert.ok(from.isSame(nextYear, 'isoWeek'));
        assert.ok(to.isSame(nextYear, 'isoWeek'));
        break;
      default:
        assert.notOk(true, 'Called too many times');
      }
      count++;
      return resolve([]);
    }
  });
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });


  let year = today.format('YYYY');
  this.set('year', year);
  this.set('today', today);
  this.render(hbs`{{week-glance
    collapsible=false
    collapsed=false
    showFullTitle=true
    year=year
    week=(moment-format today 'W')
  }}`);
  const title = 'h3';
  const body = 'p';
  const expectedTitle = getTitle(true);

  await wait();

  assert.equal(this.$(title).text().replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
  assert.equal(this.$(body).text().trim(), 'None');

  this.set('year', nextYear.format('YYYY'));

  return wait();
});
