import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Service, Object, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('user-profile-secondary-cohorts-manager', 'Integration | Component | user profile secondary cohorts manager', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(4);

  let school = Object.create({
    title: 'Medicine',
    id: 1,
  });
  let program = Object.create({
    title: 'MD',
    school: school,
    id: 1,
  });

  // Class of 2016-2018
  let cohorts = [];
  for(let i = 1; i <= 3; i++) {
    let programYear = Object.create({
      program: program,
      id: i,
    });
    let cohort = Object.create({
      title: 'Class of ' + (2015 + i),
      programYear: programYear,
      id: i,
    });
    cohorts.pushObject(cohort);
  }

  let primaryCohort = cohorts[0]; // Class of 2016

  // assignable classes: Pharm MD, Class 2022
  school = Object.create({
    title: 'Pharmacy',
    id: 100,
  });
  program = Object.create({
    title: 'Pharm MD',
    school: school,
    id: 100,
  });

  let currentUserMock = Service.extend({
    cohortsInAllAssociatedSchools: resolve([
      Object.create({
        title: 'Class of 2022',
        id: 100,
        programYear: Object.create({
          id: 100,
          program: program
        })
      })
    ])
  });

  this.set('cohorts', cohorts);
  this.set('primaryCohort', primaryCohort);
  this.register('service:currentUser', currentUserMock);
  this.render(hbs`{{user-profile-secondary-cohorts-manager cohorts=cohorts primaryCohort=primaryCohort}}`);
  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Medicine\s+\|\s+MD\s+\|\s+Class of 2018/), 0, 'Class of 2018 shows first.');
    assert.ok(this.$().text().trim().search(/Medicine\s+\|\s+MD\s+\|\s+Class of 2017/) > 0, 'Class of 2017 shows second, sort order works.');
    assert.equal(this.$().text().trim().search(/Class of 2016/), -1, 'Primary cohort does not show');
    assert.ok(this.$().text().trim().search(/Pharmacy\s+\|\s+Pharm MD\s+\|\s+Class of 2022/) > 0);
  });
});

