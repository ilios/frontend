import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | weekly events', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('year', 2017);
    this.set('expandedWeeks', []);
    this.set('nothing', parseInt);
    await render(hbs`{{weekly-events
      year=year
      expandedWeeks=expandedWeeks
      setYear=(action nothing)
      toggleOpenWeek=(action nothing)
    }}`);
    const yearPickers = '.year';
    const weeks = '.week-glance';

    assert.equal(this.$(yearPickers).length, 2);
    assert.equal(this.$(yearPickers).eq(0).text().trim(), '2017');
    assert.equal(this.$(yearPickers).eq(1).text().trim(), '2017');

    assert.equal(this.$(weeks).length, 52);
  });

  test('goes forward by years', async function(assert) {
    this.set('year', 2017);
    this.set('expandedWeeks', []);
    this.set('nothing', parseInt);
    this.set('setYear', newYear => {
      assert.equal(2018, newYear, 'we moved forward');
      this.set('year', newYear);
    });
    await render(hbs`{{weekly-events
      year=year
      expandedWeeks=expandedWeeks
      setYear=(action setYear)
      toggleOpenWeek=(action nothing)
    }}`);
    const yearPickers = '.year';
    const moveForward = `${yearPickers}:eq(0) i.fa-forward`;
    const weeks = '.week-glance';

    this.$(moveForward).click();

    assert.equal(this.$(yearPickers).eq(0).text().trim(), '2018');
    assert.equal(this.$(yearPickers).eq(1).text().trim(), '2018');

    assert.equal(this.$(weeks).length, 52);
  });

  test('goes backward by years', async function(assert) {
    this.set('year', 2017);
    this.set('expandedWeeks', []);
    this.set('nothing', parseInt);
    this.set('setYear', newYear => {
      assert.equal(2016, newYear, 'we moved backward');
      this.set('year', newYear);
    });
    await render(hbs`{{weekly-events
      year=year
      expandedWeeks=expandedWeeks
      setYear=(action setYear)
      toggleOpenWeek=(action nothing)
    }}`);
    const yearPickers = '.year';
    const moveBackward = `${yearPickers}:eq(0) i.fa-backward`;
    const weeks = '.week-glance';

    this.$(moveBackward).click();

    assert.equal(this.$(yearPickers).eq(0).text().trim(), '2016');
    assert.equal(this.$(yearPickers).eq(1).text().trim(), '2016');

    assert.equal(this.$(weeks).length, 52);
  });
});
