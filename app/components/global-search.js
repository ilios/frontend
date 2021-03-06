import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';

const MIN_INPUT = 3;

export default class GlobalSearchComponent extends Component {
  @service iliosConfig;
  @service intl;
  @service('search') iliosSearch;
  @service store;

  size = 10;
  @tracked results = [];

  get hasResults() {
    return Boolean(this.results.length);
  }

  @use allSchools = new ResolveAsyncValue(() => [this.store.findAll('school')]);
  get schools() {
    return this.allSchools ?? [];
  }

  get ignoredSchoolTitles() {
    if (!this.args.ignoredSchoolIds) {
      return [];
    }
    return this.args.ignoredSchoolIds.map((id) => {
      const school = this.schools.findBy('id', id);
      return school ? school.title : '';
    });
  }

  get yearFilteredResults() {
    if (!this.args.selectedYear) {
      return this.results;
    }

    return this.results.filter((course) => course.year === Number(this.args.selectedYear));
  }

  get filteredResults() {
    return this.yearFilteredResults.filter(
      (course) => !this.ignoredSchoolTitles.includes(course.school)
    );
  }

  get paginatedResults() {
    return this.filteredResults.slice(
      this.args.page * this.size - this.size,
      this.args.page * this.size
    );
  }

  get schoolOptions() {
    if (this.results.length && this.schools.length) {
      const emptySchools = this.schools
        .map(({ id, title }) => {
          return {
            id,
            title,
            results: 0,
          };
        })
        .sortBy('title');
      const options = this.results.reduce((set, course) => {
        const schoolOption = set.findBy('title', course.school);
        schoolOption.results++;

        return set;
      }, emptySchools);
      return options;
    }

    return [];
  }

  get yearOptions() {
    return this.results.mapBy('year').uniq().sort().reverse();
  }

  @action
  setSelectedYear(year) {
    this.args.setSelectedYear(year ? Number(year) : null);
    this.args.onSelectPage(1);
  }

  @action
  toggleSchoolSelection(id) {
    const ignoredSchoolIds = this.args.ignoredSchoolIds ? [...this.args.ignoredSchoolIds] : [];

    if (ignoredSchoolIds.includes(id)) {
      ignoredSchoolIds.removeObject(id);
    } else {
      ignoredSchoolIds.pushObject(id);
    }

    this.args.onSelectPage(1);
    this.args.setIgnoredSchoolIds(ignoredSchoolIds);
  }

  @restartableTask
  *search(el, [query]) {
    this.results = [];
    if (query?.length > MIN_INPUT) {
      const { courses } = yield this.iliosSearch.forCurriculum(query);

      this.results = courses;
    }
  }
}
