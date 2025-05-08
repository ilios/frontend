import Component from '@glimmer/component';
import { service } from '@ember/service';
import PapaParse from 'papaparse';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'frontend/utils/create-download-file';
import { DateTime } from 'luxon';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { chunk, uniqueById } from 'ilios-common/utils/array-helpers';

export default class ReportsCurriculumLearnerGroupsComponent extends Component {
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
      `offerings { id, startDate, endDate, instructors { ${userData} }, instructorGroups { id, users { ${userData} } }, learnerGroups { id, title } }`,
      `ilmSession { id, dueDate, hours, instructors { ${userData} }, instructorGroups { id, users { ${userData} } }, learnerGroups { id, title } }`,
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

  get reportWithLearnerGroups() {
    return this.reportWithInstructors.map((c) => {
      c.sessions = c.sessions.map((s) => {
        const offeringLearnerGroups = s.offerings.map((o) => o.learnerGroups.map((g) => g)).flat();
        const ilmLearnerGroups = s.ilmSession?.learnerGroups.map((g) => g) ?? [];
        const learnerGroups = [...offeringLearnerGroups, ...ilmLearnerGroups];

        s.learnerGroups = uniqueById(learnerGroups)
          .map(({ title }) => title)
          .sort();
        return s;
      });

      return c;
    });
  }

  get summary() {
    return this.reportWithLearnerGroups.map((c) => {
      return {
        schoolTitle: c.school.title,
        courseId: c.id,
        courseTitle: c.title,
        sessionCount: c.sessions.length,
        learnerGroupsCount: this.reporting.countUniqueValuesInArray(c.sessions, 'learnerGroups'),
        instructorsCount: this.reporting.countUniqueValuesInArray(c.sessions, 'instructors'),
      };
    });
  }

  get results() {
    const origin = window.location.origin;
    return this.reportWithLearnerGroups.reduce((acc, c) => {
      c.sessions.forEach((s) => {
        const path = this.router.urlFor('session', c.id, s.id);
        let firstOfferingDate;
        const firstOffering = s.offerings.sort(
          (a, b) => DateTime.fromISO(a.startDate) - DateTime.fromISO(b.startDate),
        )[0];
        if (firstOffering) {
          firstOfferingDate = firstOffering.startDate;
        } else if (s.ilmSession) {
          firstOfferingDate = s.ilmSession.dueDate;
        }
        s.learnerGroups.forEach((title) => {
          const learnerGroup = {
            courseId: c.id,
            courseTitle: c.title,
            year: c.year,
            sessionTitle: s.title,
            firstOfferingDate: firstOfferingDate
              ? DateTime.fromISO(firstOfferingDate).toLocaleString(this.intl.primaryLocale)
              : '',
            instructors: s.instructors,
            title,
            link: `${origin}${path}`,
          };

          if (this.args.hasMultipleSchools) {
            learnerGroup.schoolTitle = c.school.title;
          }

          acc.push(learnerGroup);
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

  get sessionCountPlaceholder() {
    return '5';
  }

  get instructorsCountPlaceholder() {
    return '6';
  }

  get learnerGroupsCountPlaceholder() {
    return '85';
  }

  downloadReport = dropTask(async () => {
    const data = this.sortedResults.map((o) => {
      const rhett = {};
      if (this.hasMultipleSchools) {
        rhett[this.intl.t('general.school')] = o.schoolTitle;
      }
      rhett[this.intl.t('general.school')] = o.schoolTitle;
      rhett[this.intl.t('general.id')] = o.courseId;
      rhett[this.intl.t('general.course')] = o.courseTitle;
      rhett[this.intl.t('general.year')] = o.year;
      rhett[this.intl.t('general.session')] = o.sessionTitle;
      rhett[this.intl.t('general.firstOffering')] = o.firstOfferingDate;
      rhett[this.intl.t('general.instructors')] = o.instructors.join(', ');
      rhett[this.intl.t('general.learnerGroupTitle')] = o.title;
      rhett[this.intl.t('general.link')] = o.link;

      return rhett;
    });
    const csv = PapaParse.unparse(data);
    this.finishedBuildingReport = true;
    createDownloadFile(`learner-groups.csv`, csv, 'text/csv');
    await timeout(2000);
    this.finishedBuildingReport = false;
  });
}

<Reports::Curriculum::Header
  @selectedSchoolIds={{this.selectedSchoolIds}}
  @countSelectedCourses={{@courses.length}}
  @showReportResults={{true}}
  @loading={{this.reportRunning}}
  @selectedReportValue="learnerGroups"
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
<div class="report-results {{if this.reportRunning 'running'}}" data-test-report-results>
  <table>
    <caption>{{t "general.resultsSummary"}}</caption>
    <thead>
      <tr>
        {{#if this.hasMultipleSchools}}
          <th>{{t "general.school"}}</th>
        {{/if}}
        <th>{{t "general.course"}}</th>
        <th>{{t "general.sessions"}}</th>
        <th>{{t "general.instructors"}}</th>
        <th>{{t "general.learnerGroups"}}</th>
      </tr>
    </thead>
    <tbody>
      {{#if this.reportRunning}}
        {{#each (sort-by "courseTitle" @courses) as |c|}}
          <tr>
            {{#if this.hasMultipleSchools}}
              <td>{{this.schoolTitlePlaceholder}}</td>
            {{/if}}
            <td>
              <LinkTo @route="course" @model={{c.id}}>
                {{c.title}}
              </LinkTo>
            </td>
            <td>{{this.sessionCountPlaceholder}}</td>
            <td>{{this.instructorsCountPlaceholder}}</td>
            <td>{{this.learnerGroupsCountPlaceholder}}</td>
          </tr>
        {{/each}}
      {{else}}
        {{#each (sort-by "courseTitle" this.summary) as |o|}}
          <tr data-test-result>
            {{#if this.hasMultipleSchools}}
              <td>{{o.schoolTitle}}</td>
            {{/if}}
            <td>
              <LinkTo @route="course" @model={{o.courseId}}>
                {{o.courseTitle}}
              </LinkTo>
            </td>
            <td>{{o.sessionCount}}</td>
            <td>{{o.instructorsCount}}</td>
            <td>{{o.learnerGroupsCount}}</td>
          </tr>
        {{/each}}
      {{/if}}
    </tbody>
  </table>
</div>