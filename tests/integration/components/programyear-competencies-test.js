import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

let school = EmberObject.create({
});
let program = EmberObject.create({
  school: resolve(school)
});
let programYear = EmberObject.create({
  program: resolve(program)
});
let domain1 = EmberObject.create({
  id: 1,
  title: 'domain1',
  programYears: resolve([programYear]),
});
domain1.set('domain', resolve(domain1));
let competency1 = EmberObject.create({
  id: 2,
  domain: resolve(domain1),
  title: 'competency1',
  children: resolve([]),
  programYears: resolve([programYear]),
  treeChildren: resolve([]),
});
let competency2 = EmberObject.create({
  id: 2,
  domain: resolve(domain1),
  title: 'competency2',
  children: resolve([]),
  programYears: resolve([programYear]),
  treeChildren: resolve([]),
});
domain1.set('children', resolve([competency1, competency2]));
domain1.set('treeChildren', resolve([competency1, competency2]));
school.set('competencies', resolve([domain1, competency1, competency2]));
programYear.set('competencies', resolve([competency1, competency2]));


moduleForComponent('programyear-competencies', 'Integration | Component | programyear competencies', {
  integration: true
});

test('it renders', function(assert) {
  this.set('programYear', programYear);
  this.set('nothing', parseInt);
  this.render(hbs`{{programyear-competencies
    programYear=programYear
    isManaging=false
    collapse=(action nothing)
    expand=(action nothing)
    setIsManaging=(action nothing)
  }}`);
  const title = '.title';
  const button = '.programyear-competencies-actions button';
  const list = '.programyear-competencies-content';

  assert.equal(this.$(title).text().trim(), 'Competencies (2)');
  assert.equal(this.$(button).text().trim(), 'Manage Competencies');
  assert.equal(this.$(list).text().replace(/[\t\n\s]+/g, ""), 'domain1competency1competency2');

});

test('clicking manage fires action', function(assert) {
  assert.expect(1);
  this.set('programYear', programYear);
  this.set('nothing', parseInt);
  this.set('setIsManaging', (b => {
    assert.ok(b === true);
  }));
  this.render(hbs`{{programyear-competencies
    programYear=programYear
    isManaging=false
    collapse=(action nothing)
    expand=(action nothing)
    setIsManaging=(action setIsManaging)
  }}`);
  const button = '.programyear-competencies-actions button';

  this.$(button).click();
});

test('clicking collapse fires action', function(assert) {
  assert.expect(1);
  this.set('programYear', programYear);
  this.set('nothing', parseInt);
  this.set('collapse', (() => {
    assert.ok(true);
  }));
  this.render(hbs`{{programyear-competencies
    programYear=programYear
    isManaging=false
    collapse=(action collapse)
    expand=(action nothing)
    setIsManaging=(action nothing)
  }}`);
  const title = '.title';

  this.$(title).click();
});
