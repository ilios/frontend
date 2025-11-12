import Component from '@glimmer/component';
import { service } from '@ember/service';
import PapaParse from 'papaparse';
import { DateTime } from 'luxon';
import { task, timeout } from 'ember-concurrency';
import createDownloadFile from 'frontend/utils/create-download-file';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { chunk } from 'ilios-common/utils/array-helpers';
import Header from 'frontend/components/reports/curriculum/header';
import noop from 'ilios-common/helpers/noop';
import perform from 'ember-concurrency/helpers/perform';
import add from 'ember-math-helpers/helpers/add';
import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import { LinkTo } from '@ember/routing';

export default class ReportsCurriculumSessionOfferingsComponent extends Component {
  @service router;
  @service intl;
  @service store;
  @service graphql;
  @service reporting;
  @tracked finishedBuildingReport = false;

  @cached
  get queryPromises() {
    const chunks = chunk(this.args.courses, 5);
    const userData = ['id', 'firstName', 'lastName', 'middleName', 'displayName'].join(', ');
    const sessionData = [
      'id',
      'title',
      `offerings { id, startDate, learnerGroups { id, title }, instructors { ${userData} }, instructorGroups { id, users { ${userData} } } }`,
      `ilmSession { id, dueDate, hours, instructors { ${userData} }, instructorGroups { id, users { ${userData} } } }`,
    ].join(', ');

    const data = ['id', 'title', 'year', 'school { id, title }', `sessions { ${sessionData} }`];

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

  get reportWithInstructors() {
    return this.reportResults.map((c) => {
      c.sessions = c.sessions.map(this.reporting.consolidateSessionInstructorsGraph);

      return c;
    });
  }

  get summary() {
    return this.reportWithInstructors.map((c) => {
      return {
        schoolTitle: c.school.title,
        courseId: c.id,
        courseTitle: c.title,
        courseYear: c.year,
        sessionCount: c.sessions.length,
        sessionOfferingCount: [].concat(...c.sessions.map((s) => s.offerings)).flat().length,
        instructorsCount: this.reporting.countUniqueValuesInArray(c.sessions, 'instructors'),
        learnerGroupsCount: []
          .concat(...c.sessions.map((s) => s.offerings.map((o) => o.learnerGroups)))
          .flat().length,
      };
    });
  }

  get summaryReport() {
    return this.summary;
  }

  get results() {
    const origin = window.location.origin;
    return this.reportWithInstructors.reduce((acc, c) => {
      c.sessions.forEach((s) => {
        const path = this.router.urlFor('session', c.id, s.id);
        s.offerings.forEach((o) => {
          const sessionOffering = {
            courseId: c.id,
            courseTitle: c.title,
            courseYear: c.year,
            sessionTitle: s.title,
            offeringDate: DateTime.fromISO(o.startDate).toFormat('yyyy-MM-dd, h:mm a'),
            instructors: s.instructors,
            learnerGroups: o.learnerGroups.map((lg) => lg.title),
            sessionLink: `${origin}${path}`,
          };

          if (this.hasMultipleSchools) {
            sessionOffering.schoolTitle = c.school.title;
          }

          acc.push(sessionOffering);
        });
      });
      return acc;
    }, []);
  }

  get sortedResults() {
    return this.results.sort(this.sortResults);
  }

  sortResults = (a, b) => {
    if (a.courseTitle !== b.courseTitle) {
      return a.courseTitle.localeCompare(b.courseTitle);
    }

    return a.sessionTitle.localeCompare(b.sessionTitle);
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

  get yearPlaceholder() {
    return '2025';
  }

  get sessionCountPlaceholder() {
    return '11';
  }

  get sessionOfferingCountPlaceholder() {
    return '22';
  }

  get instructorsCountPlaceholder() {
    return '11';
  }

  get learnerGroupsCountPlaceholder() {
    return '84';
  }

  downloadReport = task({ drop: true }, async () => {
    const data = this.sortedResults.map((o) => {
      const rhett = {};

      if (this.hasMultipleSchools) {
        rhett[this.intl.t('general.school')] = o.schoolTitle;
      }
      rhett[this.intl.t('general.course')] = o.courseTitle;
      rhett[this.intl.t('general.year')] = o.courseYear;
      rhett[this.intl.t('general.session')] = o.sessionTitle;
      rhett[this.intl.t('general.offeringDate')] = o.offeringDate;
      rhett[this.intl.t('general.instructors')] = o.instructors.join(', ');
      if (o.learnerGroups) {
        rhett[this.intl.t('general.learnerGroups')] = o.learnerGroups.join(', ');
      }
      rhett[this.intl.t('general.sessionLink')] = o.sessionLink;

      return rhett;
    });

    const csv = PapaParse.unparse(data);
    this.finishedBuildingReport = true;
    createDownloadFile(`offerings.csv`, csv, 'text/csv');
    await timeout(2000);
    this.finishedBuildingReport = false;
  });
  <template>
    <Header
      @selectedSchoolIds={{this.selectedSchoolIds}}
      @countSelectedCourses={{@courses.length}}
      @showReportResults={{true}}
      @loading={{this.reportRunning}}
      @selectedReportValue="sessionOfferings"
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
            <th>{{t "general.sessions"}}</th>
            <th>{{t "general.offerings"}}</th>
            <th>{{t "general.instructors"}}</th>
            <th>{{t "general.learnerGroups"}}</th>
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
                <td>{{this.yearPlaceholder}}</td>
                <td>{{this.sessionCountPlaceholder}}</td>
                <td>{{this.sessionOfferingCountPlaceholder}}</td>
                <td>{{this.instructorsCountPlaceholder}}</td>
                <td>{{this.learnerGroupsCountPlaceholder}}</td>
              </tr>
            {{/each}}
          {{else}}
            {{#each (sortBy "courseTitle" this.summaryReport) as |o|}}
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
                <td>{{o.sessionCount}}</td>
                <td>{{o.sessionOfferingCount}}</td>
                <td>{{o.instructorsCount}}</td>
                <td>{{o.learnerGroupsCount}}</td>
              </tr>
            {{/each}}
          {{/if}}
        </tbody>
      </table>
    </div>
  </template>
}
