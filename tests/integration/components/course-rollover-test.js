import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import Ember from 'ember';

const { Service, RSVP, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('course-rollover', 'Integration | Component | course rollover', {
  integration: true
});

test('it renders', function(assert) {
  let storeMock = Service.extend({
    query(){
      return [];
    }
  });
  this.register('service:store', storeMock);

  let course = Object.create({
    id: 1
  });
  this.set('course', course);

  this.render(hbs`{{course-rollover course=course}}`);

  let thisYear = parseInt(moment().format('YYYY'));

  for (let i=0; i<6; i++){
    assert.equal(this.$(`select:eq(0) option:eq(${i})`).text().trim(), `${thisYear + i} - ${thisYear + 1 + i}`);
  }
});

test('rollover course', function(assert) {
  assert.expect(10);
  let ajaxMock = Service.extend({
    request(url, {method, data}){
      let thisYear = parseInt(moment().format('YYYY'));
      assert.equal(url.trim(), '/api/courses/1/rollover');
      assert.equal(method, 'POST');
      assert.equal(data.year, thisYear);

      return resolve({
        courses: [
          {
            id: 14
          }
        ]
      });
    }
  });
  this.register('service:ajax', ajaxMock);

  let storeMock = Service.extend({
    pushPayload(obj){
      assert.ok('courses' in obj);
      assert.ok(obj.courses.length, 1);
      assert.equal(obj.courses[0].id, 14);
    },
    peekRecord(what, id){
      assert.equal(what, 'course');
      assert.equal(id, 14);

      return Object.create({
        id: 14
      });
    },
    query(){
      return [];
    }
  });
  this.register('service:store', storeMock);
  let flashmessagesMock = Ember.Service.extend({
    success(message){
      assert.equal(message, 'courses.rolloverSuccess');
    }
  });
  this.register('service:flashMessages', flashmessagesMock);

  let course = Object.create({
    id: 1
  });
  this.set('course', course);
  this.set('visit', (newCourse) => {
    assert.equal(newCourse.id, 14);
  });
  this.render(hbs`{{course-rollover course=course visit=(action visit)}}`);
  this.$('.done').click();
});



test('disable years when title already exists', function(assert) {
  assert.expect(13);
  const thisYear = parseInt(moment().format('YYYY'));

  let storeMock = Service.extend({
    query(what, {filters}){
      assert.equal(what, 'course');
      assert.ok('title' in filters);
      assert.equal(filters.title, 'to be rolled');

      return [
        {
          id: 2,
          year: thisYear
        },
        {
          id: 3,
          year: thisYear+2
        },
      ];
    }
  });
  this.register('service:store', storeMock);

  let course = Object.create({
    id: 1,
    title: 'to be rolled',
  });
  this.set('course', course);
  this.set('nothing', parseInt);
  this.render(hbs`{{course-rollover course=course visit=(action nothing)}}`);

  let options = this.$('select:eq(0) option');
  assert.ok(options.eq(0).prop('disabled'));
  assert.notOk(options.eq(1).prop('disabled'));
  assert.ok(options.eq(2).prop('disabled'));
  assert.notOk(options.eq(3).prop('disabled'));
  assert.notOk(options.eq(4).prop('disabled'));
  assert.notOk(options.eq(5).prop('disabled'));
  assert.notOk(options.eq(6).prop('disabled'));
  assert.notOk(options.eq(7).prop('disabled'));
  assert.notOk(options.eq(8).prop('disabled'));
  assert.notOk(options.eq(9).prop('disabled'));
});
