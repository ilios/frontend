import Service from '@ember/service';
import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

const { resolve } = RSVP;

let lm1, lm2, lm3, lm4, lm5, userMaterials;
let today = moment();
let tomorrow = moment().add(1, 'day');

module('Integration | Component | dashboard materials', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    lm1 = EmberObject.create({
      title: 'title1',
      absoluteFileUri: 'http://myhost.com/url1',
      sessionTitle: 'session1title',
      course: '1',
      type: 'file',
      mimetype: 'application/pdf',
      courseTitle: 'course1title',
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: today.toDate(),
    });
    lm2 = EmberObject.create({
      title: 'title2',
      link: 'http://myhost.com/url2',
      sessionTitle: 'session2title',
      course: '2',
      type: 'link',
      courseTitle: 'course2title',
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: tomorrow.toDate(),
    });
    lm3 = EmberObject.create({
      title: 'title3',
      citation: 'citationtext',
      sessionTitle: 'session3title',
      type: 'citation',
      course: '3',
      courseTitle: 'course3title',
      firstOfferingDate: today.toDate(),
    });
    lm4 = EmberObject.create({
      title: 'title4',
      absoluteFileUri: 'http://myhost.com/document.txt',
      sessionTitle: 'session4title',
      course: '1',
      type: 'file',
      mimetype: 'text/plain',
      courseTitle: 'course4title',
      instructors: ['Instructor3name', 'Instructor4name'],
      firstOfferingDate: tomorrow.toDate(),
    });
    lm5 = EmberObject.create({
      title: 'title5',
      isBlanked: true,
      course: '5',
      sessionTitle: 'session5title',
      courseTitle: 'course5title',
      firstOfferingDate: tomorrow.toDate(),
      endDate: new Date('2013-03-01T01:10:00')
    });
    userMaterials = [lm1, lm2, lm3, lm4, lm5];
  });



  test('it renders with materials', async function(assert) {
    assert.expect(39);
    const currentUserMock = Service.extend({
      currentUserId: 11
    });
    this.owner.register('service:current-user', currentUserMock);
    const iliosConfigMock = Service.extend({
      apiNameSpace: '/api'
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);

    const ajaxMock = Service.extend({
      request(url){
        let exp = new RegExp(/(\/api\/usermaterials\/11)\?before=(\d+)&after=(\d+)/);
        let matches = url.match(exp);
        assert.equal(matches.length, 4);
        assert.equal(matches[1], '/api/usermaterials/11');
        let before = moment(matches[2], 'X');
        let after = moment(matches[3], 'X');
        assert.ok(before.isSame(today.clone().add(60, 'days'), 'day'));
        assert.ok(after.isSame(today, 'day'));

        return resolve({
          userMaterials
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);
    await render(hbs`{{dashboard-materials}}`);

    const title = 'h3';
    const table = 'table:eq(0)';
    const materials = `${table} tbody tr`;

    const firstLmTitle = `${materials}:eq(0) td:eq(0)`;
    const firstLmLink = `${firstLmTitle} a:eq(0)`;
    const firstLmTypeIcon = `${firstLmTitle} .fa-file-pdf`;
    const firstLmCourseTitle = `${materials}:eq(0) td:eq(1)`;
    const firstLmSessionTitle = `${materials}:eq(0) td:eq(2)`;
    const firstLmInstructor = `${materials}:eq(0) td:eq(3)`;
    const firstLmFirstOffering = `${materials}:eq(0) td:eq(4)`;
    const firstLmDownloadLink = `${firstLmTitle} a:eq(1)`;

    const secondLmTitle = `${materials}:eq(1) td:eq(0)`;
    const secondLmLink = `${secondLmTitle} a`;
    const secondLmTypeIcon = `${secondLmTitle} .fa-paragraph`;
    const secondLmCourseTitle = `${materials}:eq(1) td:eq(1)`;
    const secondLmSessionTitle = `${materials}:eq(1) td:eq(2)`;
    const secondLmInstructor = `${materials}:eq(1) td:eq(3)`;
    const secondLmFirstOffering = `${materials}:eq(1) td:eq(4)`;

    const thirdLmTitle = `${materials}:eq(2) td:eq(0)`;
    const thirdLmLink = `${thirdLmTitle} a`;
    const thirdLmTypeIcon = `${thirdLmTitle} .fa-link`;
    const thirdLmCourseTitle = `${materials}:eq(2) td:eq(1)`;
    const thirdLmSessionTitle = `${materials}:eq(2) td:eq(2)`;
    const thirdLmInstructor = `${materials}:eq(2) td:eq(3)`;
    const thirdLmFirstOffering = `${materials}:eq(2) td:eq(4)`;

    const fourthLmTitle = `${materials}:eq(3) td:eq(0)`;
    const fourthLmLink = `${fourthLmTitle} a:eq(0)`;
    const fourthLmTypeIcon = `${fourthLmTitle} .fa-file`;
    const fourthLmCourseTitle = `${materials}:eq(3) td:eq(1)`;
    const fourthLmSessionTitle = `${materials}:eq(3) td:eq(2)`;
    const fourthLmInstructor = `${materials}:eq(3) td:eq(3)`;
    const fourthLmFirstOffering = `${materials}:eq(3) td:eq(4)`;

    const fifthLmTitle = `${materials}:eq(4) td:eq(0)`;
    const fifthLmTypeIcon = `${fifthLmTitle} .fa-clock`;
    const fifthLmCourseTitle = `${materials}:eq(4) td:eq(1)`;
    const fifthLmSessionTitle = `${materials}:eq(4) td:eq(2)`;
    const fifthLmInstructor = `${materials}:eq(4) td:eq(3)`;
    const fifthFirstOffering = `${materials}:eq(4) td:eq(4)`;

    await settled();
    assert.dom(this.element.querySelector(title)).hasText('My Learning Materials for the next 60 days');

    assert.equal(this.$(firstLmTitle).text().trim(), 'title1');
    assert.equal(this.$(firstLmLink).prop('href').trim(), 'http://myhost.com/url1?inline');
    assert.equal(this.$(firstLmTypeIcon).length, 1, 'LM type icon is present');
    assert.equal(this.$(firstLmSessionTitle).text().trim(), 'session1title');
    assert.equal(this.$(firstLmCourseTitle).text().trim(), 'course1title');
    assert.equal(this.$(firstLmInstructor).text().trim(), 'Instructor1name, Instructor2name');
    assert.equal(this.$(firstLmFirstOffering).text().trim(), today.format('L'));
    assert.equal(this.$(firstLmDownloadLink).prop('href').trim(), 'http://myhost.com/url1');

    assert.equal(this.$(secondLmTitle).text().replace(/[\t\n\s]+/g, ""), 'title3citationtext');
    assert.equal(this.$(secondLmLink).length, 0);
    assert.equal(this.$(secondLmTypeIcon).length, 1, 'LM type icon is present');
    assert.equal(this.$(secondLmSessionTitle).text().trim(), 'session3title');
    assert.equal(this.$(secondLmCourseTitle).text().trim(), 'course3title');
    assert.equal(this.$(secondLmInstructor).text().trim(), '');
    assert.equal(this.$(secondLmFirstOffering).text().trim(), today.format('L'));

    assert.equal(this.$(thirdLmTitle).text().trim(), 'title2');
    assert.equal(this.$(thirdLmLink).prop('href').trim(), 'http://myhost.com/url2');
    assert.equal(this.$(thirdLmTypeIcon).length, 1, 'LM type icon is present');
    assert.equal(this.$(thirdLmSessionTitle).text().trim(), 'session2title');
    assert.equal(this.$(thirdLmCourseTitle).text().trim(), 'course2title');
    assert.equal(this.$(thirdLmInstructor).text().trim(), 'Instructor1name, Instructor2name');
    assert.equal(this.$(thirdLmFirstOffering).text().trim(), tomorrow.format('L'));

    assert.equal(this.$(fourthLmLink).prop('href').trim(), 'http://myhost.com/document.txt');
    assert.equal(this.$(fourthLmTypeIcon).length, 1, 'LM type icon is present');
    assert.equal(this.$(fourthLmSessionTitle).text().trim(), 'session4title');
    assert.equal(this.$(fourthLmCourseTitle).text().trim(), 'course4title');
    assert.equal(this.$(fourthLmInstructor).text().trim(), 'Instructor3name, Instructor4name');
    assert.equal(this.$(fourthLmFirstOffering).text().trim(), tomorrow.format('L'));

    assert.equal(this.$(fifthLmTitle).text().trim(), 'title5');
    assert.equal(this.$(fifthLmTypeIcon).length, 1, 'LM type icon is present');
    assert.equal(this.$(fifthLmSessionTitle).text().trim(), 'session5title');
    assert.equal(this.$(fifthLmCourseTitle).text().trim(), 'course5title');
    assert.equal(this.$(fifthLmInstructor).text().trim(), '');
    assert.equal(this.$(fifthFirstOffering).text().trim(), tomorrow.format('L'));
  });

  test('it renders blank', async function(assert) {
    assert.expect(6);
    const currentUserMock = Service.extend({
      currentUserId: 11
    });
    this.owner.register('service:current-user', currentUserMock);
    const iliosConfigMock = Service.extend({
      apiNameSpace: '/api'
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);

    const ajaxMock = Service.extend({
      request(url){
        let exp = new RegExp(/(\/api\/usermaterials\/11)\?before=(\d+)&after=(\d+)/);
        let matches = url.match(exp);
        assert.equal(matches.length, 4);
        assert.equal(matches[1], '/api/usermaterials/11');
        let before = moment(matches[2], 'X');
        let after = moment(matches[3], 'X');
        assert.ok(before.isSame(today.clone().add(60, 'days'), 'day'));
        assert.ok(after.isSame(today, 'day'));

        return resolve({
          userMaterials: []
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);
    const title = 'h3';
    const body = 'p';

    await render(hbs`{{dashboard-materials}}`);
    await settled();
    assert.dom(this.element.querySelector(title)).hasText('My Learning Materials for the next 60 days');
    assert.dom(this.element.querySelector(body)).hasText('None');
  });
});
