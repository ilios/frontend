import Component from '@glimmer/component';
import { service } from '@ember/service';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class CollapsedCompetenciesComponent extends Component {
  @service store;

  @cached
  get schools() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  @cached
  get competencies() {
    return new TrackedAsyncData(this.args.subject.competencies);
  }

  get isLoading() {
    return !this.schools.isResolved || !this.competencies.isResolved;
  }

  get summary() {
    if (this.isLoading) {
      return [];
    }
    const allSchools = this.schools.value;
    const schools = this.competencies.value.reduce((schools, competency) => {
      const schoolId = competency.belongsTo('school').id();
      if (!(schoolId in schools)) {
        schools[schoolId] = {
          competencies: [],
          school: findById(allSchools, schoolId),
        };
      }
      schools[schoolId].competencies.push(competency);

      return schools;
    }, {});

    return Object.values(schools);
  }
}
