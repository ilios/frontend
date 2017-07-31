import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Service, Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

let lm1, lm2, lm3, userMaterials;
let today = moment();
let tomorrow = moment().add(1, 'day');

moduleForComponent('dashboard-materials', 'Integration | Component | dashboard materials', {
  integration: true,
  beforeEach(){
    lm1 = EmberObject.create({
      title: 'title1',
      absoluteFileUri: 'http://myhost.com/url1',
      sessionTitle: 'session1title',
      course: '1',
      type: 'link',
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

    userMaterials = [lm1, lm2, lm3];
  }
});



test('it renders with materials', async function(assert) {
  assert.expect(26);
  const currentUserMock = Service.extend({
    currentUserId: 11
  });
  this.register('service:current-user', currentUserMock);
  const iliosConfigMock = Service.extend({
    apiNameSpace: '/api'
  });
  this.register('service:iliosConfig', iliosConfigMock);

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
  this.register('service:commonAjax', ajaxMock);
  this.render(hbs`{{dashboard-materials}}`);

  const title = 'h3';
  const table = 'table:eq(0)';
  const materials = `${table} tbody tr`;
  const firstLmTitle = `${materials}:eq(0) td:eq(0)`;
  const firstLmLink = `${firstLmTitle} a`;
  const firstLmTypeIcon = `${firstLmTitle} i.fa-link`;
  const firstLmCourseTitle = `${materials}:eq(0) td:eq(1)`;
  const firstLmSessionTitle = `${materials}:eq(0) td:eq(2)`;
  const firstLmInstructor = `${materials}:eq(0) td:eq(3)`;
  const firstLmFirstOffering = `${materials}:eq(0) td:eq(4)`;

  const secondLmTitle = `${materials}:eq(1) td:eq(0)`;
  const secondLmLink = `${secondLmTitle} a`;
  const secondLmTypeIcon = `${secondLmTitle} i.fa-paragraph`;
  const secondLmCourseTitle = `${materials}:eq(1) td:eq(1)`;
  const secondLmSessionTitle = `${materials}:eq(1) td:eq(2)`;
  const secondLmInstructor = `${materials}:eq(1) td:eq(3)`;
  const secondLmFirstOffering = `${materials}:eq(1) td:eq(4)`;

  const thirdLmTitle = `${materials}:eq(2) td:eq(0)`;
  const thirdLmLink = `${thirdLmTitle} a`;
  const thirdLmTypeIcon = `${thirdLmTitle} i.fa-link`;
  const thirdLmCourseTitle = `${materials}:eq(2) td:eq(1)`;
  const thirdLmSessionTitle = `${materials}:eq(2) td:eq(2)`;
  const thirdLmInstructor = `${materials}:eq(2) td:eq(3)`;
  const thirdLmFirstOffering = `${materials}:eq(2) td:eq(4)`;

  await wait();
  assert.equal(this.$(title).text().trim(), 'My Learning Materials for the next 60 days');
  assert.equal(this.$(firstLmTitle).text().trim(), 'title1');
  assert.equal(this.$(firstLmLink).prop('href').trim(), 'http://myhost.com/url1');
  assert.equal(this.$(firstLmTypeIcon).length, 1, 'LM type icon is present');
  assert.equal(this.$(firstLmSessionTitle).text().trim(), 'session1title');
  assert.equal(this.$(firstLmCourseTitle).text().trim(), 'course1title');
  assert.equal(this.$(firstLmInstructor).text().trim(), 'Instructor1name, Instructor2name');
  assert.equal(this.$(firstLmFirstOffering).text().trim(), today.format('L'));

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

});

test('it renders blank', async function(assert) {
  assert.expect(6);
  const currentUserMock = Service.extend({
    currentUserId: 11
  });
  this.register('service:current-user', currentUserMock);
  const iliosConfigMock = Service.extend({
    apiNameSpace: '/api'
  });
  this.register('service:iliosConfig', iliosConfigMock);

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
  this.register('service:commonAjax', ajaxMock);
  const title = 'h3';
  const body = 'p';

  this.render(hbs`{{dashboard-materials}}`);
  await wait();
  assert.equal(this.$(title).text().trim(), 'My Learning Materials for the next 60 days');
  assert.equal(this.$(body).text().trim(), 'None');
});
