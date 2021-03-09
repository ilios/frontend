import Component from '@glimmer/component';
import config from '../config/environment';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { enqueueTask } from 'ember-concurrency';
const {
  IliosFeatures: { programYearVisualizations },
} = config;

export default class ProgramYearOverviewComponent extends Component {
  programYearVisualizations = programYearVisualizations;

  @use directors = new ResolveAsyncValue(() => [this.args.programYear.directors, []]);

  get directorsWithFullName() {
    return this.directors.filterBy('fullName');
  }
  get sortedDirectors() {
    return this.directorsWithFullName.sortBy('fullName');
  }

  @enqueueTask
  *addDirector(user) {
    const directors = yield this.args.programYear.directors;
    directors.addObject(user);
    yield this.args.programYear.save();
  }

  @enqueueTask
  *removeDirector(user) {
    const directors = yield this.args.programYear.directors;
    directors.removeObject(user);
    yield this.args.programYear.save();
  }
}
