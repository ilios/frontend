import Ember from 'ember';

const { Component, RSVP, Object:EmberObject, computed, isEmpty } = Ember;
const { Promise, map } = RSVP;

export default Component.extend({
  classNameBindings: [':user-profile-learnergroups', ':large-component'],

  user: null,

  selectedLearnerGroups: computed('user.learnerGroups.[]', function(){
    const user = this.get('user');
    return new Promise(resolve => {
      if (isEmpty(user)) {
        resolve([]);
        return;
      }
      user.get('learnerGroups').then(learnerGroups => {
        map(learnerGroups.toArray(), learnerGroup => {
          return new Promise(resolve => {
            learnerGroup.get('cohort').then(cohort => {
              cohort.get('program').then(program => {
                cohort.get('school').then(school => {
                  const allParentsTitle = learnerGroup.get('allParentsTitle');
                  const title = learnerGroup.get('title');
                  const schoolTitle = school.get('title');
                  const programTitle = program.get('title');
                  const cohortTitle = cohort.get('title');

                  let learnerGroupObject = EmberObject.create({
                    allParentsTitle,
                    title,
                    schoolTitle,
                    programTitle,
                    cohortTitle,
                    sortTitle: schoolTitle + programTitle + cohortTitle + allParentsTitle + title
                  });

                  resolve(learnerGroupObject);

                });
              });
            });
          });
        }).then(groupObjects => {
          resolve(groupObjects.sortBy('sortTitle'));
        });
      });
    });
  }),

});
