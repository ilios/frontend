import Component from '@glimmer/component';
import { service } from '@ember/service';
import { findBy, findById, mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class GlobalSearchComponent extends Component {
  @service iliosConfig;
  @service intl;
  @service('search') iliosSearch;
  @service store;

  size = 10;

  @cached
  get resultsData() {
    return new TrackedAsyncData(
      this.args.query ? this.iliosSearch.forCurriculum(this.args.query) : null,
    );
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  get results() {
    if (this.resultsData.isResolved && this.resultsData.value) {
      return this.resultsData.value.courses;
    }

    return [];
  }

  get hasResults() {
    return Boolean(this.results.length);
  }

  get schools() {
    if (!this.schoolData.isResolved) {
      return [];
    }

    return this.schoolData.value;
  }

  get ignoredSchoolTitles() {
    if (!this.args.ignoredSchoolIds) {
      return [];
    }
    return this.args.ignoredSchoolIds.map((id) => {
      const school = findById(this.schools, id);
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
}
