import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll } from '@ember/test-helpers';
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
    assert.dom('th').hasText('School');
    assert.dom(findAll('th')[1]).hasText('Program');
    assert.dom(findAll('th')[2]).hasText('Cohort');
    assert.dom(findAll('th')[3]).hasText('Level');
    assert.dom('tbody tr').exists({ count: 2 });
    assert.dom('tbody tr:nth-of-type(1) td').hasText('School of Life');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[1]).hasText('Professional Pie Eating');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[2]).hasText('Aardvark');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[3]).hasText('1');
    assert.dom('tbody tr:nth-of-type(2) td').hasText('Starfleet Academy');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[1]).hasText('Doctor of Rocket Surgery');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[2]).hasText('Class of 2011');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[3]).hasText('2');
  });
});


