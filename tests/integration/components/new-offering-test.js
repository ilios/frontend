import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/load-common-translations";

moduleForComponent('new-offering', 'Integration | Component | new offering', {
  integration: true,
  setup(){
    initializer.initialize(getOwner(this));
  }
});

test('it renders', function(assert) {
  this.set('nothing', parseInt);
  this.set('today', new Date());
  this.set('cohorts', []);
  this.render(hbs`{{new-offering
    session=session
    cohorts=cohorts
    courseStartDate=today
    courseEndDate=today
    close=(action nothing)
  }}`);

  assert.equal(this.$('.new-offering-title:eq(0)').text().trim(), 'New Offering');
});
