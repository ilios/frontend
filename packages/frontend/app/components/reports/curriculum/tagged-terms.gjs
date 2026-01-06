import Component from '@glimmer/component';
import { service } from '@ember/service';
import PapaParse from 'papaparse';
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

export default class ReportsCurriculumTaggedTermsComponent extends Component {
  @service router;
  @service intl;
  @service store;
  @service graphql;
  @service reporting;
  @tracked finishedBuildingReport = false;

  @cached
  get queryPromises() {
    const chunks = chunk(this.args.courses, 5);
    const sessionData = ['id', 'title', 'terms { id, title, vocabulary { title } }'].join(', ');

    const data = [
      'id',
      'title',
      'terms { id, title, vocabulary { title } }',
      'school { id, title }',
      `sessions { ${sessionData} }`,
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
    return !this.queryPromises.every((tad) => tad.isResolved);
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
      return {
        schoolTitle: c.school.title,
        courseId: c.id,
        courseTitle: c.title,
        courseTermsCount: c.terms.length,
        sessionCount: c.sessions.length,
        sessionTermsCount: c.sessions.reduce((acc, s) => acc + s.terms.length, 0),
      };
    });
  }

  get results() {
    const origin = window.location.origin;
    return this.reportResults.reduce((acc, c) => {
      if (c.terms.length) {
        c.terms.sort().forEach((cTerm) => {
          const courseTerm = {
            courseId: c.id,
            courseTitle: c.title,
            courseTerms: c.terms,
            courseTermTitle: cTerm.title,
            courseTermVocabulary: cTerm.vocabulary.title,
            courseLink: `${origin}${this.router.urlFor('course', c.id)}`,
            sessionTitle: '',
          };

          if (this.hasMultipleSchools) {
            courseTerm.schoolTitle = c.school.title;
          }

          acc.push(courseTerm);
        });
      }
      c.sessions.forEach((s) => {
        s.terms.forEach((sTerm) => {
          const sessionTerm = {
            courseId: c.id,
            courseTitle: c.title,
            courseTerms: [],
            sessionTitle: s.title,
            sessionTermTitle: sTerm.title,
            sessionTermVocabulary: sTerm.vocabulary.title,
            sessionLink: `${origin}${this.router.urlFor('session', c.id, s.id)}`,
          };

          if (this.hasMultipleSchools) {
            sessionTerm.schoolTitle = c.school.title;
          }

          acc.push(sessionTerm);
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
    return '11';
  }

  get courseTermsCountPlaceholder() {
    return '11';
  }

  get sessionTermsCountPlaceholder() {
    return '84';
  }

  downloadReport = task({ drop: true }, async () => {
    const data = this.sortedResults.map((o) => {
      const rhett = {};

      if (this.hasMultipleSchools) {
        rhett[this.intl.t('general.school')] = o.schoolTitle;
      }
      rhett[this.intl.t('general.course')] = o.courseTitle;

      if (o.courseTerms.length) {
        rhett[this.intl.t('general.courseTerm')] = o.courseTermTitle;
        rhett[this.intl.t('general.session')] = '';
        rhett[this.intl.t('general.sessionTerm')] = '';
        rhett[this.intl.t('general.vocabulary')] = o.courseTermVocabulary;
        rhett[this.intl.t('general.link')] = o.courseLink;
      } else {
        rhett[this.intl.t('general.courseTerm')] = '';
        rhett[this.intl.t('general.session')] = o.sessionTitle;
        rhett[this.intl.t('general.sessionTerm')] = o.sessionTermTitle;
        rhett[this.intl.t('general.vocabulary')] = o.sessionTermVocabulary;
        rhett[this.intl.t('general.link')] = o.sessionLink;
      }

      return rhett;
    });
    const csv = PapaParse.unparse(data);
    this.finishedBuildingReport = true;
    createDownloadFile(`terms.csv`, csv, 'text/csv');
    await timeout(2000);
    this.finishedBuildingReport = false;
  });
  <template>
    <Header
      @selectedSchoolIds={{this.selectedSchoolIds}}
      @countSelectedCourses={{@courses.length}}
      @showReportResults={{true}}
      @loading={{this.reportRunning}}
      @selectedReportValue="taggedTerms"
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
            <th>{{t "general.courseTerms"}}</th>
            <th>{{t "general.sessions"}}</th>
            <th>{{t "general.sessionTerms"}}</th>
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
                <td>{{this.courseTermsCountPlaceholder}}</td>
                <td>{{this.sessionCountPlaceholder}}</td>
                <td>{{this.sessionTermsCountPlaceholder}}</td>
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
                <td>{{o.courseTermsCount}}</td>
                <td>{{o.sessionCount}}</td>
                <td>{{o.sessionTermsCount}}</td>
              </tr>
            {{/each}}
          {{/if}}
        </tbody>
      </table>
    </div>
  </template>
}
