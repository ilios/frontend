import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll, find } from '@ember/test-helpers';
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
    assert.equal(find('th').textContent, 'School');
    assert.equal(find(findAll('th')[1]).textContent, 'Program');
    assert.equal(find(findAll('th')[2]).textContent, 'Cohort');
    assert.equal(find(findAll('th')[3]).textContent, 'Level');
    assert.equal(findAll('tbody tr').length, 2);
    assert.equal(find('tbody tr:nth-of-type(1) td').textContent.trim(), 'School of Life');
    assert.equal(find(findAll('tbody tr:nth-of-type(1) td')[1]).textContent.trim(), 'Professional Pie Eating');
    assert.equal(find(findAll('tbody tr:nth-of-type(1) td')[2]).textContent.trim(), 'Aardvark');
    assert.equal(find(findAll('tbody tr:nth-of-type(1) td')[3]).textContent.trim(), '1');
    assert.equal(find('tbody tr:nth-of-type(2) td').textContent.trim(), 'Starfleet Academy');
    assert.equal(find(findAll('tbody tr:nth-of-type(2) td')[1]).textContent.trim(), 'Doctor of Rocket Surgery');
    assert.equal(find(findAll('tbody tr:nth-of-type(2) td')[2]).textContent.trim(), 'Class of 2011');
    assert.equal(find(findAll('tbody tr:nth-of-type(2) td')[3]).textContent.trim(), '2');
  });
});


