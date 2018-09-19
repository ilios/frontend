import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | collapsed stewards', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(5);
    let school1 = EmberObject.create({
      id: 1,
      title: 'school1'
    });
    let school2 = EmberObject.create({
      id: 2,
      title: 'school2'
    });
    let department1 = EmberObject.create({
      id: 1,
      school: resolve(school1)
    });
    let department2 = EmberObject.create({
      id: 2,
      school: resolve(school1)
    });
    school1.set('departments', resolve([department1, department2]));
    let department3 = EmberObject.create({
      id: 3,
      school: resolve(school2)
    });
    school2.set('departments', resolve([department3]));

    let programYear = EmberObject.create();
    let steward1 = EmberObject.create({
      programYear: resolve(programYear),
      school: resolve(school1),
      department: resolve(department1)
    });
    department1.set('stewards', resolve([steward1]));

    let steward2 = EmberObject.create({
      programYear: resolve(programYear),
      school: resolve(school1),
      department: resolve(department2)
    });
    department2.set('stewards', resolve([steward2]));
    school1.set('stewards', resolve([steward1, steward2]));

    let steward3 = EmberObject.create({
      programYear: resolve(programYear),
      school: resolve(school2),
      department: resolve(department3)
    });
    department3.set('stewards', resolve([steward2]));
    programYear.set('stewards', resolve([steward1, steward2, steward3]));
    school2.set('stewards', resolve([steward3]));


    this.set('programYear', programYear);
    this.set('nothing', () => { });
    await render(hbs`{{collapsed-stewards
      programYear=programYear
      expand=(action nothing)
    }}`);

    const title = '.title';
    const table = 'table';
    const school1Row = `${table} tbody tr:nth-of-type(1)`;
    const school2Row = `${table} tbody tr:nth-of-type(2)`;
    const school1Title = `${school1Row} td:nth-of-type(1)`;
    const school2Title = `${school2Row} td:nth-of-type(1)`;
    const school1Departments = `${school1Row} td:nth-of-type(2)`;
    const school2Departments = `${school2Row} td:nth-of-type(2)`;

    await settled();
    assert.dom(title).hasText('Stewarding Schools and Departments (3)');
    assert.dom(school1Title).hasText('school1');
    assert.dom(school2Title).hasText('school2');
    assert.dom(school1Departments).hasText('2');
    assert.dom(school2Departments).hasText('1');
  });

  test('clicking the header expands the list', async function(assert) {
    assert.expect(1);
    let programYear = EmberObject.create({
      stewards: resolve([])
    });
    this.set('programYear', programYear);

    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`{{collapsed-stewards
      programYear=programYear
      expand=(action click)
    }}`);
    const title = '.title';

    await click(title);
  });
});
