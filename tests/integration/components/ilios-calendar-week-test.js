import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ilios-calendar-week', 'Integration | Component | ilios calendar week', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);
  let date = new Date('2015-09-30T12:00:00');
  this.set('date', date);

  this.render(hbs`{{ilios-calendar-week date=date}}`);
  assert.equal(this.$().text().trim().search(/^Week of September/), 0);
  assert.equal(this.$('.event').length, 0);
});

test('clicking on a day header fires the correct events', function(assert) {
  assert.expect(4);
  let date = new Date('2015-09-30T12:00:00');
  this.set('date', date);
  this.on('changeDate', newDate => {
    assert.ok(newDate instanceof Date);
    assert.ok(newDate.toString().search(/Sun Sep 27/) === 0);
  });
  this.on('changeView', newView => {
    assert.equal(newView, 'day');
  });

  this.render(hbs`{{ilios-calendar-week
    date=date
    changeDate=(action 'changeDate')
    changeView=(action 'changeView')
  }}`);

  const weekTitles = '.week-titles .cell';
  const sunday = `${weekTitles}:eq(1)`;

  assert.ok(this.$(sunday).hasClass('clickable'));

  this.$(sunday).click();
});

test('clicking on a day header does nothing when areDaysSelectable is false', function(assert) {
  assert.expect(1);
  let date = new Date('2015-09-30T12:00:00');
  this.set('date', date);
  this.set('nothing', () => {
    assert.ok(false, 'this should never be called');
  });

  this.render(hbs`{{ilios-calendar-week
    date=date
    areDaysSelectable=false
    changeDate=(action nothing)
    changeView=(action nothing)
  }}`);

  const weekTitles = '.week-titles .cell';
  const sunday = `${weekTitles}:eq(1)`;

  assert.notOk(this.$(sunday).hasClass('clickable'));

  this.$(sunday).click();
});
