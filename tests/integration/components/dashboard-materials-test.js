import Service from '@ember/service';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

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
    const table = 'table:nth-of-type(1)';
    const materials = `${table} tbody tr`;

    const firstLmTitle = `${materials}:nth-of-type(1) td:nth-of-type(1)`;
    const firstLmLink = `${firstLmTitle} a:nth-of-type(1)`;
    const firstLmTypeIcon = `${firstLmTitle} .fa-file-pdf`;
    const firstLmCourseTitle = `${materials}:nth-of-type(1) td:nth-of-type(2)`;
    const firstLmSessionTitle = `${materials}:nth-of-type(1) td:nth-of-type(3)`;
    const firstLmInstructor = `${materials}:nth-of-type(1) td:nth-of-type(4)`;
    const firstLmFirstOffering = `${materials}:nth-of-type(1) td:nth-of-type(5)`;
    const firstLmDownloadLink = `${firstLmTitle} a:nth-of-type(2)`;

    const secondLmTitle = `${materials}:nth-of-type(2) td:nth-of-type(1)`;
    const secondLmLink = `${secondLmTitle} a`;
    const secondLmTypeIcon = `${secondLmTitle} .fa-paragraph`;
    const secondLmCourseTitle = `${materials}:nth-of-type(2) td:nth-of-type(2)`;
    const secondLmSessionTitle = `${materials}:nth-of-type(2) td:nth-of-type(3)`;
    const secondLmInstructor = `${materials}:nth-of-type(2) td:nth-of-type(4)`;
    const secondLmFirstOffering = `${materials}:nth-of-type(2) td:nth-of-type(5)`;

    const thirdLmTitle = `${materials}:nth-of-type(3) td:nth-of-type(1)`;
    const thirdLmLink = `${thirdLmTitle} a`;
    const thirdLmTypeIcon = `${thirdLmTitle} .fa-link`;
    const thirdLmCourseTitle = `${materials}:nth-of-type(3) td:nth-of-type(2)`;
    const thirdLmSessionTitle = `${materials}:nth-of-type(3) td:nth-of-type(3)`;
    const thirdLmInstructor = `${materials}:nth-of-type(3) td:nth-of-type(4)`;
    const thirdLmFirstOffering = `${materials}:nth-of-type(3) td:nth-of-type(5)`;

    const fourthLmTitle = `${materials}:nth-of-type(4) td:nth-of-type(1)`;
    const fourthLmLink = `${fourthLmTitle} a:nth-of-type(1)`;
    const fourthLmTypeIcon = `${fourthLmTitle} .fa-file`;
    const fourthLmCourseTitle = `${materials}:nth-of-type(4) td:nth-of-type(2)`;
    const fourthLmSessionTitle = `${materials}:nth-of-type(4) td:nth-of-type(3)`;
    const fourthLmInstructor = `${materials}:nth-of-type(4) td:nth-of-type(4)`;
    const fourthLmFirstOffering = `${materials}:nth-of-type(4) td:nth-of-type(5)`;

    const fifthLmTitle = `${materials}:nth-of-type(5) td:nth-of-type(1)`;
    const fifthLmTypeIcon = `${fifthLmTitle} .fa-clock`;
    const fifthLmCourseTitle = `${materials}:nth-of-type(5) td:nth-of-type(2)`;
    const fifthLmSessionTitle = `${materials}:nth-of-type(5) td:nth-of-type(3)`;
    const fifthLmInstructor = `${materials}:nth-of-type(5) td:nth-of-type(4)`;
    const fifthFirstOffering = `${materials}:nth-of-type(5) td:nth-of-type(5)`;

    assert.dom(this.element.querySelector(title)).hasText('My Learning Materials for the next 60 days');

    assert.ok(find(firstLmTitle).textContent.includes('title1'));
    assert.equal(find(firstLmLink).href, 'http://myhost.com/url1?inline');
    assert.dom(firstLmTypeIcon).exists({ count: 1 }, 'LM type icon is present');
    assert.dom(firstLmSessionTitle).hasText('session1title');
    assert.dom(firstLmCourseTitle).hasText('course1title');
    assert.dom(firstLmInstructor).hasText('Instructor1name, Instructor2name');
    assert.dom(firstLmFirstOffering).hasText(today.format('L'));
    assert.equal(find(firstLmDownloadLink).href.trim(), 'http://myhost.com/url1');

    assert.equal(find(secondLmTitle).textContent.replace(/[\t\n\s]+/g, ""), 'Citationtitle3citationtext');
    assert.dom(secondLmLink).doesNotExist();
    assert.dom(secondLmTypeIcon).exists({ count: 1 }, 'LM type icon is present');
    assert.dom(secondLmSessionTitle).hasText('session3title');
    assert.dom(secondLmCourseTitle).hasText('course3title');
    assert.dom(secondLmInstructor).hasText('');
    assert.dom(secondLmFirstOffering).hasText(today.format('L'));

    assert.ok(find(thirdLmTitle).textContent.includes('title2'));
    assert.equal(find(thirdLmLink).href.trim(), 'http://myhost.com/url2');
    assert.dom(thirdLmTypeIcon).exists({ count: 1 }, 'LM type icon is present');
    assert.dom(thirdLmSessionTitle).hasText('session2title');
    assert.dom(thirdLmCourseTitle).hasText('course2title');
    assert.dom(thirdLmInstructor).hasText('Instructor1name, Instructor2name');
    assert.dom(thirdLmFirstOffering).hasText(tomorrow.format('L'));

    assert.equal(find(fourthLmLink).href.trim(), 'http://myhost.com/document.txt');
    assert.dom(fourthLmTypeIcon).exists({ count: 1 }, 'LM type icon is present');
    assert.dom(fourthLmSessionTitle).hasText('session4title');
    assert.dom(fourthLmCourseTitle).hasText('course4title');
    assert.dom(fourthLmInstructor).hasText('Instructor3name, Instructor4name');
    assert.dom(fourthLmFirstOffering).hasText(tomorrow.format('L'));

    assert.ok(find(fifthLmTitle).textContent.includes('title5'));
    assert.dom(fifthLmTypeIcon).exists({ count: 1 }, 'LM type icon is present');
    assert.dom(fifthLmSessionTitle).hasText('session5title');
    assert.dom(fifthLmCourseTitle).hasText('course5title');
    assert.dom(fifthLmInstructor).hasText('');
    assert.dom(fifthFirstOffering).hasText(tomorrow.format('L'));
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
    assert.dom(this.element.querySelector(title)).hasText('My Learning Materials for the next 60 days');
    assert.dom(this.element.querySelector(body)).hasText('None');
  });
});
