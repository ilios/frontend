import RSVP from 'rsvp';
import Service from '@ember/service';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, settled, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

const today = moment();

const mockEvents = [
  {
    name: 'Learn to Learn',
    startDate: today.format(),
    location: 'Room 123',
    sessionTypeTitle: 'Lecture',
    courseExternalId: 'C1',
    sessionDescription: 'Best <strong>Session</strong> For Sure' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
    isBlanked: false,
    isPublished: true,
    isScheduled: false,
    learningMaterials: [
      {
        title: 'Citation LM',
        type: 'citation',
        required: true,
        publicNotes: 'This is cool.',
        citation: 'citationtext',
      },
      {
        title: 'Link LM',
        type: 'link',
        required: false,
        link: 'http://myhost.com/url2',
      },
      {
        title: 'File LM',
        type: 'file',
        filename: 'This is a PDF',
        mimetype: 'application/pdf',
        required: true,
        absoluteFileUri: 'http://myhost.com/url1',
      },
    ],
    attireRequired: true,
    equipmentRequired: true,
    attendanceRequired: true,
    supplemental: true,
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
        type: 'file',
        filename: 'This is another PDF',
        mimetype: 'application/pdf',
        absoluteFileUri: 'http://myhost.com/url1',
        publicNotes: 'slide notes',
      },
    ],
    instructors: [
      'Second Person',
      'First Person',
    ],
    attireRequired: false,
    equipmentRequired: false,
    attendanceRequired: false,
    supplemental: false,
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
  {
    name: 'Schedule some materials',
    startDate: today.format(),
    location: 'Room 123',
    sessionTypeTitle: 'Lecture',
    courseExternalId: 'C1',
    sessionDescription: 'Best <strong>Session</strong> For Sure' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
    isBlanked: false,
    isPublished: true,
    isScheduled: false,
    learningMaterials: [
      {
        title: 'In the window',
        type: 'citation',
        required: true,
        isBlanked: false,
        citation: 'citationtext',
        endDate: today.clone().add(1, 'day').toDate(),
        startDate: today.clone().subtract(1, 'day').toDate(),
      },
      {
        title: 'Too Early',
        type: 'citation',
        required: true,
        isBlanked: true,
        citation: 'citationtext',
        startDate: moment('2001-12-31').toDate(),
      },
      {
        title: 'Too Late',
        type: 'citation',
        required: true,
        isBlanked: true,
        citation: 'citationtext',
        endDate: moment('2035-06-01').toDate(),
      },
    ],
    attireRequired: true,
    equipmentRequired: true,
    attendanceRequired: true,
    supplemental: true,
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

module('Integration | Component | week glance', function(hooks) {
  setupRenderingTest(hooks);

  const getTitle = function(fullTitle){
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
    if (fullTitle) {
      expectedTitle += ' Week at a Glance';
    }

    return expectedTitle;
  };

  test('it renders with events', async function(assert) {
    assert.expect(40);
    this.owner.register('service:user-events', userEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');
    this.set('today', today);
    await render(hbs`{{week-glance
      collapsible=false
      collapsed=false
      showFullTitle=true
      year=(moment-format today 'YYYY')
      week=(moment-format today 'W')
    }}`);
    const title = 'h3';
    const events = '.event';
    const firstEvent = `${events}:nth-of-type(1)`;
    const secondEvent = `${events}:nth-of-type(2)`;
    const thirdEvent = `${events}:nth-of-type(3)`;

    const firstEventTitle = `${firstEvent} .title`;
    const firstSessionType = `${firstEvent} .sessiontype`;
    const firstLocation = `${firstEvent} .location`;
    const firstDescription = `${firstEvent} .description`;
    const firstLearningMaterials = `${firstEvent} .learning-material`;
    const firstLm1 = `${firstLearningMaterials}:nth-of-type(1)`;
    const firstLm1TypeIcon = `${firstLm1} .fa-paragraph`;
    const firstLm1IconTitle = `${firstLm1TypeIcon} title`;
    const firstLm1Notes = `${firstLm1} .public-notes`;
    const firstLm2 = `${firstLearningMaterials}:nth-of-type(2)`;
    const firstLm2TypeIcon = `${firstLm2} .fa-link`;
    const firstLm2IconTitle = `${firstLm2TypeIcon} title`;
    const firstLm2Notes = `${firstLm2} .public-notes`;
    const firstLm2Link = `${firstLm2} a`;
    const firstLm3 = `${firstLearningMaterials}:nth-of-type(3)`;
    const firstLm3Link = `${firstLm3} a:nth-of-type(1)`;
    const firstLm3TypeIcon = `${firstLm3} .fa-file-pdf`;
    const firstLm3IconTitle = `${firstLm3TypeIcon} title`;
    const firstLm3DownloadLink = `${firstLm3} a:nth-of-type(2)`;
    const firstInstructors = `${firstEvent} .instructors`;
    const firstAttributes = `${firstEvent} .session-attributes svg`;
    const secondEventTitle = `${secondEvent} .title`;
    const secondSessionType = `${secondEvent} .sessiontype`;
    const secondLocation = `${secondEvent} .location`;
    const secondDescription = `${secondEvent} .description`;
    const secondLearningMaterials = `${secondEvent} .learning-material`;
    const secondLm1 = `${secondLearningMaterials}:nth-of-type(1)`;
    const secondLm1Link = `${secondLm1} a`;
    const secondLm1TypeIcon = `${secondLm1} .fa-file-pdf`;
    const secondLm1Notes = `${secondLm1} .public-notes`;
    const secondInstructors = `${secondEvent} .instructors`;
    const secondAttributes = `${secondEvent} .session-attributes i`;
    const thirdEventTitle = `${thirdEvent} .title`;
    const thirdLearningMaterials = `${thirdEvent} .learning-material`;
    const thirdLm1 = `${thirdLearningMaterials}:nth-of-type(1)`;
    const thirdLm1Schedule = `${thirdLm1} .timed-release-info`;
    const thirdLm2 = `${thirdLearningMaterials}:nth-of-type(2)`;
    const thirdLm2Schedule = `${thirdLm2} .timed-release-info`;
    const thirdLm3 = `${thirdLearningMaterials}:nth-of-type(3)`;
    const thirdLm3Schedule = `${thirdLm3} .timed-release-info`;


    await settled();

    const expectedTitle = getTitle(true);
    assert.equal(this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
    assert.equal(this.element.querySelectorAll(events).length, 3, 'Blank events are not shown');
    assert.equal(find(firstEventTitle).textContent.trim(), 'Learn to Learn');
    assert.equal(find(firstSessionType).textContent.trim(), 'Lecture');
    assert.equal(find(firstLocation).textContent.trim(), '- Room 123');
    assert.equal(find(firstDescription).textContent.trim(), 'Best Session For SureLorem ipsum dolor sit amet, c');
    assert.equal(find(firstLm1).textContent.replace(/[\t\n\s]+/g, ""), 'CitationCitationLMcitationtextThisiscool.');
    assert.equal(findAll(firstLm1TypeIcon).length, 1, 'LM type icon is present.');
    assert.equal(find(firstLm1IconTitle).textContent.trim(), 'Citation', 'LM type icon has correct title.');
    assert.equal(find(firstLm1Notes).textContent.replace(/[\t\n\s]+/g, ""), 'Thisiscool.');
    assert.ok(find(firstLm2).textContent.includes('Link LM'));
    assert.equal(findAll(firstLm2TypeIcon).length, 1, 'LM type icon is present.');
    assert.equal(find(firstLm2IconTitle).textContent.trim(), 'Web Link', 'LM type icon has correct title.');
    assert.equal(findAll(firstLm2Notes).length, 0);
    assert.equal(find(firstLm2Link).href, 'http://myhost.com/url2');
    assert.ok(find(firstLm3).textContent.includes('File LM'));
    assert.equal(findAll(firstLm3TypeIcon).length, 1, 'LM type icon is present.');
    assert.equal(find(firstLm3IconTitle).textContent.trim(), 'File', 'LM type icon has correct title.');
    assert.equal(find(firstLm3Link).href, 'http://myhost.com/url1?inline');
    assert.equal(find(firstLm3DownloadLink).href, 'http://myhost.com/url1');
    assert.equal(findAll(firstInstructors).length, 0, 'No Instructors leaves and empty spot');
    assert.equal(findAll(firstAttributes).length, 4, 'All attributes flags show up');
    assert.equal(this.element.querySelector('.fa-black-tie title').textContent, 'Whitecoats / special attire');
    assert.equal(this.element.querySelector('.fa-flask title').textContent, 'Special Equipment');
    assert.equal(this.element.querySelector('.fa-calendar-check title').textContent, 'Attendance is required');

    assert.equal(find(secondEventTitle).textContent.trim(), 'Finding the Point in Life');
    assert.equal(find(secondSessionType).textContent.trim(), 'Independent Learning');
    assert.equal(find(secondLocation).textContent.trim(), '- Room 456');
    assert.equal(findAll(secondDescription).length, 0, 'Empty Description is Empty');
    assert.equal(findAll(secondLm1TypeIcon).length, 1, 'LM type icon is present.');
    assert.ok(find(secondLm1Link).textContent.includes('Great Slides'));
    assert.equal(find(secondLm1Notes).textContent.trim(), 'slide notes');
    assert.equal(find(secondLm1Link).href, 'http://myhost.com/url1?inline');
    assert.equal(find(secondInstructors).textContent.replace(/[\t\n\s]+/g, ""), 'Instructors:FirstPerson,SecondPerson', 'Instructors sorted and formated correctly');
    assert.equal(findAll(secondAttributes).length, 0, 'no attributes flags show up');

    assert.equal(find(thirdEventTitle).textContent.trim(), 'Schedule some materials');
    assert.equal(findAll(thirdLearningMaterials).length, 3, 'all lms are visible');
    assert.equal(findAll(thirdLm1Schedule).length, 1, 'event in between says something');
    assert.equal(findAll(thirdLm2Schedule).length, 1, 'early LM says something');
    assert.equal(findAll(thirdLm3Schedule).length, 1, 'late LM says something');
  });

  test('it renders blank', async function(assert) {
    assert.expect(2);
    this.owner.register('service:user-events', blankEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    this.set('today', today);
    await render(hbs`{{week-glance
      collapsible=false
      collapsed=false
      showFullTitle=true
      year=(moment-format today 'YYYY')
      week=(moment-format today 'W')
    }}`);
    const title = 'h3';
    const body = 'p';
    const expectedTitle = getTitle(true);

    await settled();

    assert.equal(this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
    assert.dom(this.element.querySelector(body)).hasText('None');

  });

  test('renders short title', async function(assert) {
    assert.expect(1);
    this.owner.register('service:user-events', blankEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    this.set('today', today);
    await render(hbs`{{week-glance
      collapsible=false
      collapsed=false
      showFullTitle=false
      year=(moment-format today 'YYYY')
      week=(moment-format today 'W')
    }}`);
    const title = 'h3';
    const expectedTitle = getTitle(false);
    await settled();

    assert.equal(this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
  });

  test('it renders collapsed', async function(assert) {
    assert.expect(2);
    this.owner.register('service:user-events', blankEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    this.set('today', today);
    await render(hbs`{{week-glance
      collapsible=true
      collapsed=true
      showFullTitle=false
      year=(moment-format today 'YYYY')
      week=(moment-format today 'W')
    }}`);
    const title = 'h3';
    const body = 'p';
    const expectedTitle = getTitle(false);

    await settled();

    assert.equal(this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
    assert.equal(this.element.querySelectorAll(body).length, 0);

  });

  test('click to expend', async function(assert) {
    assert.expect(1);
    this.owner.register('service:user-events', blankEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    this.set('today', today);
    this.set('toggle', value => {
      assert.ok(value);
    });
    await render(hbs`{{week-glance
      collapsible=true
      collapsed=true
      showFullTitle=false
      year=(moment-format today 'YYYY')
      week=(moment-format today 'W')
      toggleCollapsed=(action toggle)
    }}`);
    const title = 'h3';
    await settled();
    await click(title);
  });

  test('click to collapse', async function(assert) {
    assert.expect(1);
    this.owner.register('service:user-events', blankEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    this.set('today', today);
    this.set('toggle', value => {
      assert.notOk(value);
    });
    await render(hbs`{{week-glance
      collapsible=true
      collapsed=false
      showFullTitle=false
      year=(moment-format today 'YYYY')
      week=(moment-format today 'W')
      toggleCollapsed=(action toggle)
    }}`);
    const title = 'h3';
    await settled();
    await click(title);
  });

  test('changing passed properties re-renders', async function(assert) {
    assert.expect(10);
    const nextYear = today.clone().add(1, 'year');
    let count = 1;
    blankEventsMock = Service.reopen({
      getEvents(fromStamp, toStamp){
        const from = moment(fromStamp, 'X');
        const to = moment(toStamp, 'X');
        switch (count) {
        case 1:
          assert.ok(from.isSame(today, 'year'), 'From-date has same year as today.');
          assert.ok(to.isSame(today, 'year'), 'To-date has same year as today.');
          assert.ok(from.isSame(today, 'week'), 'From-date has same week as today.');
          assert.ok(to.isSame(today, 'week'), 'To-date has same wek as today.');
          break;
        case 2:
          assert.ok(from.isSame(nextYear, 'year'), 'From-date has same year as next year.');
          assert.ok(to.isSame(nextYear, 'year'), 'To-date has same year as next year.');
          // comparing weeks needs some wiggle room as dates may be shifting across week lines.
          assert.ok(1 >= Math.abs(from.week() - nextYear.week()), 'From-date is at the most one week off from next year.');
          assert.ok(1 >= Math.abs(to.week() - nextYear.week()), 'To-date has is at the most one week off from next year.');
          break;
        default:
          assert.notOk(true, 'Called too many times');
        }
        count++;
        return resolve([]);
      }
    });
    this.owner.register('service:user-events', blankEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');


    let year = today.format('YYYY');
    this.set('year', year);
    this.set('today', today);
    await render(hbs`{{week-glance
      collapsible=false
      collapsed=false
      showFullTitle=true
      year=year
      week=(moment-format today 'W')
    }}`);
    const title = 'h3';
    const body = 'p';
    const expectedTitle = getTitle(true);

    await settled();

    assert.equal(this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ""), expectedTitle.replace(/[\t\n\s]+/g, ""));
    assert.dom(this.element.querySelector(body)).hasText('None');

    this.set('year', nextYear.format('YYYY'));

    return settled();
  });
});
