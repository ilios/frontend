import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | detail cohort list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(13);
    const school1 = EmberObject.create({
      title: 'School of Life'
    });
    const school2 = EmberObject.create({
      title: 'Starfleet Academy'
    });

    const program1 = EmberObject.create({
      title: 'Professional Pie Eating',
      school: school1
    });
    const program2 = EmberObject.create({
      title: 'Doctor of Rocket Surgery',
      school: school2
    });
    const programYear1 = EmberObject.create({
      program: program1,
      classOfYear: 2015,
    }) ;
    const programYear2 = EmberObject.create({
      program: program2,
      classOfYear: 2011,
    });
    const cohort1 = EmberObject.create({
      title: 'Aardvark',
      classOfYear: programYear1.get('classOfYear'),
      programYear: programYear1,
      school: school1,
      currentLevel: 1
    });
    const cohort2 = EmberObject.create({
      classOfYear: programYear2.get('classOfYear'),
      programYear: programYear2,
      school: school2,
      currentLevel: 2
    });

    const cohorts = [ cohort1, cohort2 ];

    this.set('cohorts', cohorts);
    await render(hbs`{{detail-cohort-list cohorts=cohorts}}`);
    await settled();
    assert.equal(this.$('th:eq(0)').text(), 'School');
    assert.equal(this.$('th:eq(1)').text(), 'Program');
    assert.equal(this.$('th:eq(2)').text(), 'Cohort');
    assert.equal(this.$('th:eq(3)').text(), 'Level');
    assert.equal(this.$('tbody tr').length, 2);
    assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), 'School of Life');
    assert.equal(this.$('tbody tr:eq(0) td:eq(1)').text().trim(), 'Professional Pie Eating');
    assert.equal(this.$('tbody tr:eq(0) td:eq(2)').text().trim(), 'Aardvark');
    assert.equal(this.$('tbody tr:eq(0) td:eq(3)').text().trim(), '1');
    assert.equal(this.$('tbody tr:eq(1) td:eq(0)').text().trim(), 'Starfleet Academy');
    assert.equal(this.$('tbody tr:eq(1) td:eq(1)').text().trim(), 'Doctor of Rocket Surgery');
    assert.equal(this.$('tbody tr:eq(1) td:eq(2)').text().trim(), 'Class of 2011');
    assert.equal(this.$('tbody tr:eq(1) td:eq(3)').text().trim(), '2');
  });
});