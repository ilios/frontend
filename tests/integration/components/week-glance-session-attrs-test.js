import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import initializer from "ilios/instance-initializers/ember-i18n";
import wait from 'ember-test-helpers/wait';


const { RSVP, Service, Object:EmberObject } = Ember;
const { resolve } = RSVP;

moduleForComponent('week-glance-session-attrs', 'Integration | Component | week glance session attrs', {
  integration: true,
  setup(){
    initializer.initialize(this);
  },
});

test('it renders', async function(assert) {
  assert.expect(4);

  const mockEvent = EmberObject.create({});
  const userEventsMock = Service.extend({
    getSessionForEvent(e){
      assert.equal(e, mockEvent);
      let mockSession = EmberObject.create({
        attireRequired: true,
        equipmentRequired: true,
        attendanceRequired: true,
      });
      return new resolve(mockSession);
    }
  });

  this.register('service:user-events', userEventsMock);
  this.set('event', mockEvent);

  this.render(hbs`{{week-glance-session-attrs event=event}}`);

  await wait();

  assert.equal(this.$('.fa-black-tie').attr('title'), 'Whitecoats / special attire');
  assert.equal(this.$('.fa-flask').attr('title'), 'Special Equipment');
  assert.equal(this.$('.fa-calendar-check-o').attr('title'), 'Attendance is required');
});

test('only show applicable session attributes', async function(assert) {
  assert.expect(4);

  const mockEvent = EmberObject.create({});
  const userEventsMock = Service.extend({
    getSessionForEvent(e){
      assert.equal(e, mockEvent);
      let mockSession = EmberObject.create({
        attireRequired: true,
        equipmentRequired: false,
        attendanceRequired: false,
      });
      return new resolve(mockSession);
    }
  });

  this.register('service:user-events', userEventsMock);
  this.set('event', mockEvent);

  this.render(hbs`{{week-glance-session-attrs event=event}}`);

  await wait();

  assert.equal(this.$('.fa-black-tie').attr('title'), 'Whitecoats / special attire');
  assert.notOk(this.$('.fa-flask').length);
  assert.notOk(this.$('.fa-calendar-check-o').notOk);
});
