import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('new-offering', 'Integration | Component | new offering', {
  integration: true
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

  assert.equal(this.$('.title').text().trim(), 'New Offering');
});
