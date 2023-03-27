import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { findById } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class CollapsedCompetenciesComponent extends Component {
  @service store;

  @use allSchools = new ResolveAsyncValue(() => [this.store.findAll('school')]);
  @use competencies = new ResolveAsyncValue(() => [this.args.subject.competencies]);

  get summary() {
    if (!this.allSchools || !this.competencies) {
      return [];
    }
    const schools = this.competencies.reduce((schools, competency) => {
      const schoolId = competency.belongsTo('school').id();
      if (!(schoolId in schools)) {
        schools[schoolId] = {
          competencies: [],
          school: findById(this.allSchools, schoolId),
        };
      }
      schools[schoolId].competencies.push(competency);

      return schools;
    }, {});

    return Object.values(schools);
  }
}
