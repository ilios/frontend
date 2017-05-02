import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object:EmberObject, Service } = Ember;
const { resolve } = RSVP;

moduleForComponent('user-profile-cohorts', 'Integration | Component | user profile cohorts', {
  integration: true,
  beforeEach(){
    this.register('service:currentUser', currentUserMock);
  }
});
let som = EmberObject.create({
  id: '1',
  title: 'SOM'
});
let sod = EmberObject.create({
  id: '2',
  title: 'SOD'
});
let program1 = EmberObject.create({
  title: 'Program1',
  school: resolve(som)
});
let program2 = EmberObject.create({
  title: 'Program2',
  school: resolve(sod)
});
let programYear1 = EmberObject.create({
  program: resolve(program1),
  published: true,
  archived: false,
});
let programYear2 = EmberObject.create({
  program: resolve(program2),
  published: true,
  archived: false,
});
let programYear3 = EmberObject.create({
  program: resolve(program2),
  published: true,
  archived: false,
});
let programYear4 = EmberObject.create({
  program: resolve(program2),
  published: true,
  archived: false,
});
program1.set('programYears', resolve([programYear1, programYear4]));
program2.set('programYears', resolve([programYear2, programYear3]));

let cohort1 = EmberObject.create({
  id: 1,
  title: 'Cohort1',
  programYear: resolve(programYear1),
  program: resolve(program1),
  school: resolve(som)
});

let cohort2 = EmberObject.create({
  id: 2,
  title: 'Cohort2',
  programYear: resolve(programYear2),
  program: resolve(program2),
  school: resolve(sod)
});

let cohort3 = EmberObject.create({
  id: 3,
  title: 'Cohort3',
  programYear: resolve(programYear3),
  program: resolve(program2),
  school: resolve(sod)
});

let cohort4 = EmberObject.create({
  id: 4,
  title: 'Cohort4',
  programYear: resolve(programYear4),
  program: resolve(program1),
  school: resolve(som)
});
programYear1.set('cohort', resolve(cohort1));
programYear2.set('cohort', resolve(cohort2));
programYear3.set('cohort', resolve(cohort3));
programYear4.set('cohort', resolve(cohort4));
som.set('programs', resolve([program1]));
sod.set('programs', resolve([program2]));

let usercohorts = [cohort1, cohort2];

let user = EmberObject.create({
  primaryCohort: resolve(cohort1),
  cohorts: resolve(usercohorts),
});

const mockCurrentUser = EmberObject.create({
  schools: resolve([som, sod]),
  school: resolve(som),
});

const currentUserMock = Service.extend({
  model: resolve(mockCurrentUser),
  cohortsInAllAssociatedSchools: resolve([cohort1, cohort2, cohort3, cohort4])
});


test('it renders', function(assert) {
  this.set('user', user);
  this.render(hbs`{{user-profile-cohorts user=user}}`);
  const primaryCohort = 'p:eq(0)';
  const secondaryCohorts = 'ul:eq(0) li';

  return wait().then(()=>{
    assert.equal(this.$(primaryCohort).text().replace(/[\t\n\s]+/g, ""), 'PrimaryCohort:SOMProgram1Cohort1', 'primary cohort correct');
    assert.equal(this.$(secondaryCohorts).length, 1, 'correct number of secondary cohorts');
    assert.equal(this.$(secondaryCohorts).text().trim(), 'SOD Program2 Cohort2', 'cohort correct');
  });
});

test('clicking manage sends the action', function(assert) {
  assert.expect(1);
  this.set('user', user);
  this.set('click', (what) =>{
    assert.ok(what, 'recieved boolean true value');
  });
  this.render(hbs`{{user-profile-cohorts user=user isManagable=true setIsManaging=(action click)}}`);
  const manage = 'button.manage';
  this.$(manage).click();
});

test('can edit user cohorts', function(assert) {
  assert.expect(12);

  this.set('user', user);
  this.set('nothing', parseInt);

  user.set('save', ()=> {
    assert.equal(user.get('primaryCohort'), cohort2, 'user has correct primary cohort');

    assert.ok(!usercohorts.includes(cohort1), 'cohort1 has been removed');
    assert.ok(usercohorts.includes(cohort2), 'cohort2 is still present');
    assert.ok(usercohorts.includes(cohort3), 'cohort3 has been added');

    return resolve(user);
  });

  this.render(hbs`{{user-profile-cohorts isManaging=true user=user setIsManaging=(action nothing)}}`);
  const primaryCohort = 'p:eq(0)';
  const secondaryCohorts = 'ul:eq(0) li';
  const schoolPicker = 'select:eq(0)';
  const assignableCohorts = 'ul:eq(1) li';
  const promoteFirstSecondaryCohort = `${secondaryCohorts}:eq(0) i.add`;
  const removeFirstSecondaryCohort = `${secondaryCohorts}:eq(0) i.remove`;
  const addFirstAssignableCohort = `${assignableCohorts}:eq(0) i.add`;

  return wait().then(()=>{
    assert.equal(this.$(primaryCohort).text().replace(/[\t\n\s]+/g, ""), 'PrimaryCohort:SOMProgram1Cohort1', 'primary cohort correct');
    assert.equal(this.$(secondaryCohorts).length, 1, 'correct number of secondary cohorts');
    assert.equal(this.$(secondaryCohorts).text().trim(), 'SOD Program2 Cohort2', 'cohort correct');
    assert.equal(this.$(schoolPicker).val(), '1', 'correct school selected');
    assert.equal(this.$(assignableCohorts).length, 1, 'correct number of assignable cohorts');
    assert.equal(this.$(assignableCohorts).text().trim(), 'Program1 Cohort4', 'cohort correct');

    this.$(schoolPicker).val('2').change();
    return wait().then(()=>{
      assert.equal(this.$(assignableCohorts).length, 1, 'correct number of assignable cohorts');
      assert.equal(this.$(assignableCohorts).text().trim(), 'Program2 Cohort3', 'cohort correct');

      this.$(promoteFirstSecondaryCohort).click();

      return wait().then(()=>{
        this.$(removeFirstSecondaryCohort).click();
        this.$(addFirstAssignableCohort).click();

        this.$('.bigadd').click();

        return wait();
      });

    });
  });
});
