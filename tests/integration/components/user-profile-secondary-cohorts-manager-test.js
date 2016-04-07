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
  // @todo refactor [ST 2016/04/12]
  let currentUserMock = Service.extend({
    model: resolve(Object.create({
      schools: resolve([
        Object.create({
          id: 100,
          programs: resolve([
            Object.create({
              id: 100,
              programYears: resolve([
                Object.create({
                  id: 100,
                  cohort: resolve(Object.create({
                    id: 100,
                    title: 'Class of 2022',
                    programYear: Object.create({
                      id: 100,
                      program: Object.create({
                        id: 100,
                        title: 'Pharm MD',
                        school: Object.create({
                          id: 100,
                          title: 'Pharmacy'
                        })
                      })
                    })
                  }))
                })
              ])
            })
          ])
        })
      ])
    }))
  });

  this.set('cohorts', cohorts);
  this.set('primaryCohort', primaryCohort);
  this.register('service:currentUser', currentUserMock);
  this.render(hbs`{{user-profile-secondary-cohorts-manager cohorts=cohorts primaryCohort=primaryCohort}}`);
  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Medicine\s+\|\s+MD\s+\|\s+Class of 2018/), 0);
    assert.ok(this.$().text().trim().search(/Medicine\s+\|\s+MD\s+\|\s+Class of 2017/) > 0);
    assert.equal(this.$().text().trim().search(/Class of 2016/), -1, 'Primary cohort does not show');
    assert.ok(this.$().text().trim().search(/Pharmacy\s+\|\s+Pharm MD\s+\|\s+Class of 2022/) > 0);
  });
});

