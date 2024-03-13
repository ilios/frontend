import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { findBy, findById, mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';

const MIN_INPUT = 3;

export default class GlobalSearchComponent extends Component {
  @service iliosConfig;
  @service intl;
  @service('search') iliosSearch;
  @service store;

  size = 10;
  @tracked results = [];

  @cached
  get allSchools() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  get hasResults() {
    return Boolean(this.results.length);
  }

  get schools() {
    return this.allSchools.isResolved ? this.allSchools.value : [];
  }

  get ignoredSchoolTitles() {
    if (!this.args.ignoredSchoolIds) {
      return [];
    }
    return this.args.ignoredSchoolIds.map((id) => {
      const school = findById(this.schools.slice(), id);
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
      (course) => !this.ignoredSchoolTitles.includes(course.school),
    );
  }

  get paginatedResults() {
    return this.filteredResults.slice(
      this.args.page * this.size - this.size,
      this.args.page * this.size,
    );
  }

  get schoolOptions() {
    if (this.yearFilteredResults.length && this.schools.length) {
      const emptySchools = sortBy(
        this.schools.map(({ id, title }) => {
          return {
            id,
            title,
            results: 0,
          };
        }),
        'title',
      );
      const options = this.yearFilteredResults.reduce((set, course) => {
        const schoolOption = findBy(set, 'title', course.school);
        schoolOption.results++;

        return set;
      }, emptySchools);
      return options;
    }

    return [];
  }

  get yearOptions() {
    return uniqueValues(mapBy(this.results, 'year')).sort().reverse();
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
      ignoredSchoolIds.splice(ignoredSchoolIds.indexOf(id), 1);
    } else {
      ignoredSchoolIds.push(id);
    }

    this.args.onSelectPage(1);
    this.args.setIgnoredSchoolIds(ignoredSchoolIds);
  }

  search = restartableTask(async (el, [query]) => {
    this.results = [];
    if (query?.length > MIN_INPUT) {
      const { courses } = await this.iliosSearch.forCurriculum(query);

      this.results = courses;
    }
  });
}
