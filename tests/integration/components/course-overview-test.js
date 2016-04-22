import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('course-overview', 'Integration | Component | course overview', {
  integration: true
});

const { Object, Service, RSVP } = Ember;
const { resolve } = RSVP;

test('renders with no course id', function(assert) {
  let storeMock = Service.extend({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  let course = Object.create({
    clerkshipType: resolve(Object.create())
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  assert.equal(this.$('.courseexternalid').text().trim(), 'Click to edit');

});
