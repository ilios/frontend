import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { defer } from 'rsvp';

export default class InstructorGroupsRoute extends Route {
  @service currentUser;
  @service store;
  @service session;

  queryParams = {
    titleFilter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model() {
    const rsvpDefer = defer();
    const model = {};
    this.get('currentUser.model').then((currentUser) => {
      this.store.findAll('school').then((schools) => {
        model.schools = schools;
        currentUser.get('school').then((primarySchool) => {
          model.primarySchool = primarySchool;
          rsvpDefer.resolve(model);
        });
      });
    });
    return rsvpDefer.promise;
  }
}
