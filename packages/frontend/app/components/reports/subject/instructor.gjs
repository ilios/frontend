import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize, capitalize } from '@ember/string';
import { chunk, uniqueById, sortBy } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';
import SubjectHeader from 'frontend/components/reports/subject-header';
import t from 'ember-intl/helpers/t';
import SubjectDownload from 'frontend/components/reports/subject-download';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectInstructorComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allInstructorsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allInstructors() {
    return this.allInstructorsData.isResolved ? this.allInstructorsData.value : [];
  }

  get mappedInstructors() {
    return this.allInstructors.map(({ firstName, middleName, lastName, displayName, school }) => {
      if (displayName) {
        if (this.showSchool) {
          return { schoolTitle: school.title, name: displayName };
        }
        return { name: displayName };
      }

      const middleInitial = middleName ? middleName.charAt(0) : false;

      if (middleInitial) {
        if (this.showSchool) {
          return { schoolTitle: school.title, name: `${firstName} ${middleInitial}. ${lastName}` };
        }
        return { name: `${firstName} ${middleInitial}. ${lastName}` };
      } else {
        if (this.showSchool) {
          return { schoolTitle: school.title, name: `${firstName} ${lastName}` };
        }
        return { name: `${firstName} ${lastName}` };
      }
    });
  }

  get sortedInstructors() {
    if (this.showSchool) {
      return sortBy(this.mappedInstructors, ['schoolTitle', 'name']);
    }

    return sortBy(this.mappedInstructors, ['name']);
  }

  get limitedInstructors() {
    return this.sortedInstructors.slice(0, this.resultsLengthMax);
  }

  get showSchool() {
    return !this.args.school;
  }

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
    const rhett = [];
    if (school) {
      rhett.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      const specialInstructed = ['learningMaterials', 'sessionTypes', 'sessions', 'academicYears'];
      if (specialInstructed.includes(what)) {
        what = 'instructed' + capitalize(what);
      }
      rhett.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }

    return rhett;
  }

  async getResultsForCourses(courseIds) {
    const userInfo = '{ id firstName middleName lastName displayName school { title } }';
    const block = `instructorGroups {  users ${userInfo}} instructors ${userInfo}`;

    const filters = [`ids: [${courseIds.join(',')}]`];
    const attributes = [
      `sessions {
        ilmSession { ${block} }
        offerings { ${block} }
      }`,
      'school { title }',
    ];

    const results = await this.graphql.find('courses', filters, attributes.join(', '));

    if (!results.data.courses.length) {
      return [];
    }

    const sessions = results.data.courses.map(({ sessions }) => sessions).flat();

    const users = sessions.reduce((acc, session) => {
      if (session.ilmSession) {
        acc.push(
          ...session.ilmSession.instructors,
          ...session.ilmSession.instructorGroups.flatMap((group) => group.users),
        );
      }
      session.offerings.forEach((offering) => {
        acc.push(
          ...offering.instructors,
          ...offering.instructorGroups.flatMap((group) => group.users),
        );
      });

      return acc;
    }, []);

    return uniqueById(users);
  }

  async getResultsForAcademicYear(academicYearId, school) {
    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    filters.push(`academicYears: [${academicYearId}]`);

    const attributes = ['id', 'school { title }'];
    const results = await this.graphql.find('courses', filters, attributes.join(', '));

    if (!results.data.courses.length) {
      return [];
    }

    const ids = results.data.courses.map(({ id }) => id);

    //fetch courses 5 at a time for performance on the API
    //but send all the requests at once
    const promises = chunk(ids, 5).map((chunk) => this.getResultsForCourses(chunk));

    const users = await (await Promise.all(promises)).flat();
    return uniqueById(users);
  }

  async getResultsForLearningMaterial(learningMaterialId, school) {
    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    filters.push(`learningMaterials: [${learningMaterialId}]`);

    const attributes = ['id', 'school { title }'];
    const results = await this.graphql.find('courses', filters, attributes.join(', '));

    if (!results.data.courses.length) {
      return [];
    }

    const ids = results.data.courses.map(({ id }) => id);

    //fetch courses 5 at a time for performance on the API
    //but send all the requests at once
    const promises = chunk(ids, 5).map((chunk) => this.getResultsForCourses(chunk));

    const users = await (await Promise.all(promises)).flat();

    return uniqueById(users);
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'instructor') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectInstructorComponent`);
    }

    if (prepositionalObject === 'learning material') {
      return this.getResultsForLearningMaterial(prepositionalObjectTableRowId, school);
    }

    if (prepositionalObject === 'course') {
      return this.getResultsForCourses([prepositionalObjectTableRowId]);
    }

    if (prepositionalObject === 'academic year') {
      return this.getResultsForAcademicYear(prepositionalObjectTableRowId, school);
    }

    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );
    const attributes = ['firstName', 'middleName', 'lastName', 'displayName', 'school { title }'];
    const result = await this.graphql.find('users', filters, attributes.join(', '));
    return result.data.users;
  }

  get reportResultsExceedMax() {
    return this.allInstructors.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    if (this.showSchool) {
      return [
        [this.intl.t('general.school'), this.intl.t('general.instructors')],
        ...this.sortedInstructors.map(({ schoolTitle, name }) => [schoolTitle, name]),
      ];
    }
    return [
      [this.intl.t('general.instructors')],
      ...this.sortedInstructors.map(({ name }) => [name]),
    ];
  }
  <template>
    <SubjectHeader
      @report={{@report}}
      @school={{@school}}
      @subject={{@subject}}
      @prepositionalObject={{@prepositionalObject}}
      @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
      @year={{@year}}
      @showYearFilter={{false}}
      @description={{@description}}
      @fetchDownloadData={{this.fetchDownloadData}}
      @readyToDownload={{this.allInstructorsData.isResolved}}
      @resultsLength={{this.allInstructors.length}}
    />
    <div data-test-reports-subject-instructor>
      {{#if this.allInstructorsData.isResolved}}
        <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
          {{#each this.limitedInstructors as |instructor|}}
            <li>
              {{#if this.showSchool}}
                <span class="school" data-test-school>
                  {{instructor.schoolTitle}}:
                </span>
              {{/if}}
              <span data-test-name>
                {{instructor.name}}
              </span>
            </li>
          {{else}}
            <li>{{t "general.none"}}</li>
          {{/each}}
        </ul>
        {{#if this.reportResultsExceedMax}}
          <SubjectDownload
            @report={{@report}}
            @subject={{@subject}}
            @prepositionalObject={{@prepositionalObject}}
            @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
            @school={{@school}}
            @fetchDownloadData={{this.fetchDownloadData}}
            @readyToDownload={{true}}
            @message={{t "general.reportResultsExceedMax" resultsLengthMax=this.resultsLengthMax}}
          />
        {{/if}}
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </div>
  </template>
}
