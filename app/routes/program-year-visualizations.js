import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  _loadedProgramYears: {},
  async model(params) {
    return this.loadModel(params.program_year_id);
  },
  async afterModel(programYear) {
    return this.loadModel(programYear.id);
  },
  async loadModel(programYearId){
    if (!( programYearId in this._loadedProgramYears)) {
      this._loadedProgramYears[programYearId] = this.store.findRecord('program-year', programYearId, {
        include: 'program,competencies,programYearObjectives.courseObjectives.sessionObjectives.sessions,cohort.courses.courseObjectives,cohort.courses.sessions.sessionObjectives',
        reload: true,
      });
    }

    return this._loadedProgramYears[programYearId];
  }
});
