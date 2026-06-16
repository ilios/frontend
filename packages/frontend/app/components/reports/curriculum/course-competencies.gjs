import Component from '@glimmer/component';
import { service } from '@ember/service';
import PapaParse from 'papaparse';
import striptags from 'striptags';
import { task, timeout } from 'ember-concurrency';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { chunk } from 'ilios-common/utils/array-helpers';
import Header from './header';
import noop from 'ilios-common/helpers/noop';
import perform from 'ember-concurrency/helpers/perform';
import add from 'ember-math-helpers/helpers/add';
import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import { LinkTo } from '@ember/routing';

export default class ReportsCurriculumCourseCompetenciesComponent extends Component {
  @service router;
  @service intl;
  @service store;
  @service graphql;
  @service reporting;
  @tracked finishedBuildingReport = false;

  @cached
  get queryPromises() {
    const chunks = chunk(this.args.courses, 5);
    const programYearObjectivesData = [
      'id',
      'title',
      'programYearObjectives { id, title, competency { id, title } }',
    ].join(', ');

    const data = [
      'id',
      'title',
      'year',
      'school { id, title }',
      `courseObjectives { ${programYearObjectivesData} }`,
    ];

    return chunks.map((courses) => {
      const courseIds = courses.map((c) => c.id);
      const filters = [`ids: [${courseIds.join(', ')}]`];
      return new TrackedAsyncData(this.graphql.find('courses', filters, data.join(', ')));
    });
  }

  get completedPromises() {
    return this.queryPromises.filter((tad) => tad.isResolved);
  }

  get reportRunning() {
    return this.queryPromises.length > this.completedPromises.length;
  }

  get reportResults() {
    if (this.reportRunning) {
      return [];
    }
    return this.completedPromises
      .map(({ value }) => value)
      .map(({ data }) => data.courses)
      .flat();
  }

  get summary() {
    return this.reportResults.map((c) => {
      const courseObjectiveCount = c.courseObjectives.length;
      const programYearObjectiveCount = c.courseObjectives.reduce(
        (acc, co) => acc + co.programYearObjectives.length,
        0,
      );
      const competencies = [];
      c.courseObjectives.forEach((co) => {
        co.programYearObjectives.forEach((pyo) => {
          if (pyo.competency) {
            competencies.push(pyo.competency.title);
          }
        });
      });
      // only want unique competencies
      const competencyCount = new Set(competencies).size;

      return {
        schoolTitle: c.school.title,
        courseId: c.id,
        courseTitle: c.title,
        courseYear: c.year,
        courseObjectiveCount,
        programYearObjectiveCount,
        competencyCount,
      };
    });
  }

  get results() {
    const origin = window.location.origin;
    return this.reportResults.reduce((acc, c) => {
      const path = this.router.urlFor('course', c.id);
      if (c.courseObjectives.length) {
        c.courseObjectives.forEach((co) => {
          if (co.programYearObjectives.length) {
            co.programYearObjectives.forEach((pyo) => {
              const courseCompetencyRow = {
                courseId: c.id,
                courseTitle: c.title,
                courseYear: c.year,
                courseObjective: striptags(co.title),
                programYearObjective: striptags(pyo.title),
                competency: pyo.competency?.title,
                link: `${origin}${path}`,
              };

              if (this.hasMultipleSchools) {
                courseCompetencyRow.schoolTitle = c.school.title;
              }

              acc.push(courseCompetencyRow);
            });
          } else {
            const courseObjectivesRow = {
              courseId: c.id,
              courseTitle: c.title,
              courseYear: c.year,
              courseObjective: striptags(co.title),
              programYearObjective: '',
              competency: '',
              link: `${origin}${path}`,
            };

            if (this.hasMultipleSchools) {
              courseObjectivesRow.schoolTitle = c.school.title;
            }

            acc.push(courseObjectivesRow);
          }
        });
      } else {
        const courseResultRow = {
          courseId: c.id,
          courseTitle: c.title,
          courseYear: c.year,
          courseObjective: '',
          programYearObjective: '',
          competency: '',
          link: `${origin}${path}`,
        };

        if (this.hasMultipleSchools) {
          courseResultRow.schoolTitle = c.school.title;
        }

        acc.push(courseResultRow);
      }

      return acc;
    }, []);
  }

  get sortedResults() {
    return this.results.sort(this.sortResults);
  }

  sortResults = (a, b) => {
    return a.courseTitle.localeCompare(b.courseTitle);
  };

  get selectedSchoolIds() {
    if (!this.args.courses) {
      return [];
    }
    const schools = this.store.peekAll('school');
    let schoolIds = [];
    this.args.courses.map((course) => {
      const schoolForCourse = schools.find((school) =>
        school.hasMany('courses').ids().includes(course.id),
      );

      if (schoolForCourse) {
        schoolIds = [...schoolIds, schoolForCourse.id];
      }
    });
    return [...new Set(schoolIds)];
  }

  get countSelectedSchools() {
    return this.selectedSchoolIds.length;
  }

  get hasMultipleSchools() {
    return this.countSelectedSchools > 1;
  }

  get schoolTitlePlaceholder() {
    return 'School';
  }

  get courseObjectiveCountPlaceholder() {
    return '84';
  }

  get programYearObjectiveCountPlaceholder() {
    return '55';
  }

  get competencyCountPlaceholder() {
    return '6';
  }

  downloadReport = task({ drop: true }, async () => {
    const data = this.sortedResults.map((o) => {
      const rhett = {};

      if (this.hasMultipleSchools) {
        rhett[this.intl.t('general.school')] = o.schoolTitle;
      }
      rhett[this.intl.t('general.course')] = o.courseTitle;
      rhett[this.intl.t('general.year')] = o.courseYear;
      rhett[this.intl.t('general.courseObjective')] = o.courseObjective;
      rhett[this.intl.t('general.programObjective')] = o.programYearObjective;
      rhett[this.intl.t('general.competency')] = o.competency;
      rhett[this.intl.t('general.link')] = o.link;

      return rhett;
    });
    const csv = PapaParse.unparse(data);
    this.finishedBuildingReport = true;
    createDownloadFile(`competencies.csv`, csv, 'text/csv');
    await timeout(2000);
    this.finishedBuildingReport = false;
  });
  <template>
    <Header
      @selectedSchoolIds={{this.selectedSchoolIds}}
      @countSelectedCourses={{@courses.length}}
      @showReportResults={{true}}
      @loading={{this.reportRunning}}
      @selectedReportValue="courseCompetencies"
      @changeSelectedReport={{(noop)}}
      @close={{@close}}
      @download={{perform this.downloadReport}}
      @finished={{this.finishedBuildingReport}}
    />
    <div class="progress-container">
      {{#if this.reportRunning}}
        <progress
          value={{add 1 this.completedPromises.length}}
          max={{add 1 this.queryPromises.length}}
        ></progress>
      {{/if}}
    </div>
    <div
      class="report-results{{if this.reportRunning ' loading-shimmer loading-text running'}}"
      data-test-report-results
    >
      <table>
        <caption>{{t "general.resultsSummary"}}</caption>
        <thead>
          <tr>
            {{#if this.hasMultipleSchools}}
              <th>{{t "general.school"}}</th>
            {{/if}}
            <th>{{t "general.course"}}</th>
            <th>{{t "general.year"}}</th>
            <th>{{t "general.courseObjectives"}}</th>
            <th>{{t "general.programObjectives"}}</th>
            <th>{{t "general.competencies"}}</th>
          </tr>
        </thead>
        <tbody>
          {{#if this.reportRunning}}
            {{#each (sortBy "title" @courses) as |c|}}
              <tr>
                {{#if this.hasMultipleSchools}}
                  <td>{{this.schoolTitlePlaceholder}}</td>
                {{/if}}
                <td>
                  <LinkTo @route="course" @model={{c.id}}>
                    {{c.title}}
                  </LinkTo>
                </td>
                <td>{{this.courseYearPlaceholder}}</td>
                <td>{{this.courseObjectiveCountPlaceholder}}</td>
                <td>{{this.programYearObjectiveCountPlaceholder}}</td>
                <td>{{this.competencyCountPlaceholder}}</td>
              </tr>
            {{/each}}
          {{else}}
            {{#each (sortBy "courseTitle" this.summary) as |o|}}
              <tr data-test-result>
                {{#if this.hasMultipleSchools}}
                  <td>{{o.schoolTitle}}</td>
                {{/if}}
                <td>
                  <LinkTo @route="course" @model={{o.courseId}}>
                    {{o.courseTitle}}
                  </LinkTo>
                </td>
                <td>{{o.courseYear}}</td>
                <td>{{o.courseObjectiveCount}}</td>
                <td>{{o.programYearObjectiveCount}}</td>
                <td>{{o.competencyCount}}</td>
              </tr>
            {{/each}}
          {{/if}}
        </tbody>
      </table>
    </div>
  </template>
}
