import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('collapsed-stewards', 'Integration | Component | collapsed stewards', {
  integration: true
});

test('it renders', function(assert) {
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
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-stewards
    programYear=programYear
    expand=(action 'click')
  }}`);

  const title = '.title';
  const table = 'table';
  const school1Row = `${table} tbody tr:eq(0)`;
  const school2Row = `${table} tbody tr:eq(1)`;
  const school1Title = `${school1Row} td:eq(0)`;
  const school2Title = `${school2Row} td:eq(0)`;
  const school1Departments = `${school1Row} td:eq(1)`;
  const school2Departments = `${school2Row} td:eq(1)`;

  return wait().then(()=>{
    assert.equal(this.$(title).text().trim(), 'Stewarding Schools and Departments (3)');
    assert.equal(this.$(school1Title).text().trim(), 'school1');
    assert.equal(this.$(school2Title).text().trim(), 'school2');
    assert.equal(this.$(school1Departments).text().trim(), '2');
    assert.equal(this.$(school2Departments).text().trim(), '1');
  });
});

test('clicking the header expands the list', function(assert) {
  assert.expect(1);
  let programYear = EmberObject.create({
    stewards: resolve([])
  });
  this.set('programYear', programYear);

  this.on('click', () => {
    assert.ok(true, 'Action was fired');
  });
  this.render(hbs`{{collapsed-stewards
    programYear=programYear
    expand=(action 'click')
  }}`);
  const title = '.title';

  this.$(title).click();
});
