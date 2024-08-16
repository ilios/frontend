import Service, { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize, capitalize, dasherize } from '@ember/string';
import striptags from 'striptags';
import { mapBy, sortBy, uniqueById } from 'ilios-common/utils/array-helpers';
import { map } from 'rsvp';

const subjectTranslations = {
  course: 'general.courses',
  session: 'general.sessions',
  program: 'general.programs',
  'program year': 'general.programYears',
  instructor: 'general.instructors',
  'instructor group': 'general.instructorGroups',
  'learning material': 'general.learningMaterials',
  competency: 'general.competencies',
  'mesh term': 'general.meshTerms',
  term: 'general.terms',
  'session type': 'general.sessionTypes',
};

const objectTranslations = {
  'session type': 'general.sessionType',
  competency: 'general.competency',
  course: 'general.course',
  instructor: 'general.instructor',
  'instructor group': 'general.instructorGroup',
  'learning material': 'general.learningMaterial',
  'mesh term': 'general.meshTerm',
  program: 'general.program',
  'program year': 'general.programYear',
  session: 'general.session',
  school: 'general.school',
  term: 'general.term',
  'academic year': 'general.academicYear',
};

export default class ReportingService extends Service {
  @service store;
  @service currentUser;
  @service intl;
  @service iliosConfig;
  @service graphql;

  async getArrayResults(report, year) {
    const { subject } = report;

    const mapper = pluralize(camelize(subject)) + 'ArrayResults';
    return this[mapper](report, year);
  }

  async #getFilters(report, year) {
    const { prepositionalObject, prepositionalObjectTableRowId } = report;
    const school = await report.school;

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (year) {
      filters.push(`year: ${year}`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      if (prepositionalObject === 'mesh term') {
        what = 'meshDescriptors';
      }
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }

    return filters;
  }

  async coursesArrayResults(report, year) {
    const filters = await this.#getFilters(report, year);
    const result = await this.graphql.find('courses', filters, 'id, title, year, externalId');

    const crosses = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries',
    );
    const sortedResults = sortBy(result.data.courses, 'title');
    const mappedResults = sortedResults.map(({ title, year, externalId }) => {
      return [title, crosses ? `${year} - ${year + 1}` : `${year}`, externalId];
    });

    return [
      [
        this.intl.t('general.courses'),
        this.intl.t('general.academicYear'),
        this.intl.t('general.externalId'),
      ],
    ].concat(mappedResults);
  }

  async sessionsArrayResults(report, year) {
    const filters = await this.#getFilters(report, year);
    const attributes = [
      'id',
      'title',
      'description',
      'sessionObjectives { title }',
      'course { title, year }',
    ];
    const result = await this.graphql.find('sessions', filters, attributes.join(','));

    const crosses = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries',
    );
    const sortedResults = sortBy(result.data.sessions, 'title');
    const mappedResults = sortedResults.map(({ title, course, sessionObjectives, description }) => {
      return [
        title,
        course.title,
        crosses ? `${course.year} - ${course.year + 1}` : `${course.year}`,
        striptags(description),
        striptags(mapBy(sessionObjectives.slice(), 'title').join()),
      ];
    });

    return [
      [
        this.intl.t('general.session'),
        this.intl.t('general.course'),
        this.intl.t('general.academicYear'),
        this.intl.t('general.description'),
        this.intl.t('general.objectives'),
      ],
    ].concat(mappedResults);
  }

  async programsArrayResults(report) {
    const filters = await this.#getFilters(report);
    const attributes = ['id', 'title', 'school { title }'];
    const result = await this.graphql.find('programs', filters, attributes.join(','));
    const sortedResults = sortBy(result.data.program, 'title');
    const mappedResults = sortedResults.map(({ title, school }) => {
      return [title, school.title];
    });

    return [[this.intl.t('general.program'), this.intl.t('general.school')]].concat(mappedResults);
  }

  async programYearsArrayResults(report) {
    const filters = await this.#getFilters(report);
    const attributes = ['id', 'startYear', 'program { title, duration, school { title } }'];
    const result = await this.graphql.find('programYears', filters, attributes.join(','));
    const resultsWithClassOfYear = result.data.programYears.map((obj) => {
      const classOfYear = Number(obj.startYear) + Number(obj.program.duration);
      obj.classOfYear = String(classOfYear);

      return obj;
    });
    const sortedResults = sortBy(resultsWithClassOfYear, 'classOfYear');
    const mappedResults = sortedResults.map(({ program, classOfYear }) => {
      return [classOfYear, program.title, program.school.title];
    });

    return [
      [this.intl.t('general.year'), this.intl.t('general.program'), this.intl.t('general.school')],
    ].concat(mappedResults);
  }

  async getInstructorsArrayResultsForCourse(courseId) {
    const userInfo = '{ id firstName middleName lastName displayName }';
    const block = `instructorGroups {  users ${userInfo}}instructors ${userInfo}`;
    const results = await this.graphql.find(
      'courses',
      [`id: ${courseId}`],
      `sessions {
        ilmSession { ${block} }
        offerings { ${block} }
      }`,
    );

    if (!results.data.courses.length) {
      return [];
    }

    const users = results.data.courses[0].sessions.reduce((acc, session) => {
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

  async instructorsArrayResults(report) {
    let users;
    if (report.prepositionalObject === 'course') {
      users = await this.getInstructorsArrayResultsForCourse(report.prepositionalObjectTableRowId);
    } else {
      const filters = await this.#getFilters(report);
      const graphqlFilters = filters.map((filter) => {
        const specialInstructed = [
          'learningMaterials',
          'sessionTypes',
          'sessions',
          'academicYears',
        ];
        specialInstructed.forEach((special) => {
          if (filter.includes(special)) {
            const cap = capitalize(special);
            filter = filter.replace(special, `instructed${cap}`);
          }
        });
        return filter;
      });
      const attributes = ['id', 'firstName', 'middleName', 'lastName', 'displayName'];
      users = await this.graphql.find('users', graphqlFilters, attributes.join(','));
    }

    const names = users
      .map(({ firstName, middleName, lastName, displayName }) => {
        if (displayName) {
          return displayName;
        }

        const middleInitial = middleName ? middleName.charAt(0) : false;

        if (middleInitial) {
          return `${firstName} ${middleInitial}. ${lastName}`;
        } else {
          return `${firstName} ${lastName}`;
        }
      })
      .sort();

    return [[this.intl.t('general.instructors')]].concat(names.map((name) => [name]));
  }

  async valueResults(endpoint, report, translationKey) {
    const filters = await this.#getFilters(report);
    const attributes = ['id', 'title'];
    const result = await this.graphql.find(endpoint, filters, attributes.join(','));
    const sortedResults = sortBy(result.data[endpoint], 'title');
    const mappedResults = sortedResults.map((obj) => [obj.title]);
    return [[this.intl.t(translationKey)]].concat(mappedResults);
  }

  async instructorGroupsArrayResults(report) {
    return this.valueResults('instructorGroups', report, 'general.instructorGroups');
  }

  async learningMaterialsArrayResults(report) {
    return this.valueResults('learningMaterials', report, 'general.learningMaterials');
  }

  async competenciesArrayResults(report) {
    return this.valueResults('competencies', report, 'general.competencies');
  }

  async sessionTypesArrayResults(report) {
    return this.valueResults('sessionTypes', report, 'general.sessionTypes');
  }

  async meshTermsArrayResults(report) {
    const filters = await this.#getFilters(report);
    const attributes = ['id', 'name'];
    const result = await this.graphql.find('meshDescriptors', filters, attributes.join(','));
    const sortedResults = sortBy(result.data.meshDescriptors, 'name');
    const mappedResults = sortedResults.map((obj) => [obj.name]);
    return [[this.intl.t('general.meshTerms')]].concat(mappedResults);
  }

  async termsResults(results) {
    return map(results.slice(), async (term) => {
      const vocabulary = await term.get('vocabulary');
      const titleWithParentTitles = await term.get('titleWithParentTitles');
      const value = vocabulary.get('title') + ' > ' + titleWithParentTitles;
      return { value };
    });
  }

  async termsArrayResults(report) {
    const filters = await this.#getFilters(report);
    const result = await this.graphql.find('terms', filters, 'id');
    let terms = [];
    for (let i = 0; i < result.data.terms.length; i += 100) {
      const chunk = result.data.terms.slice(i, i + 100);
      const loadedTerms = await this.store.query('term', {
        filters: {
          id: chunk.map(({ id }) => id),
        },
      });
      terms = terms.concat(loadedTerms);
    }

    const titles = (
      await map(terms, async (term) => {
        const vocabulary = await term.vocabulary;
        const titleWithParentTitles = await term.getTitleWithParentTitles();
        return [vocabulary.title + ' > ' + titleWithParentTitles];
      })
    ).sort();
    return [[this.intl.t('general.vocabulary')]].concat(titles);
  }

  async buildReportTitle(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    try {
      const props = await this.getDescriptiveProperties(
        subject,
        prepositionalObject,
        prepositionalObjectTableRowId,
        school,
      );
      return prepositionalObject
        ? this.intl.t('general.reportDisplayTitleWithObject', props)
        : this.intl.t('general.reportDisplayTitleWithoutObject', props);
    } catch (e) {
      return this.intl.t('general.thisReportIsNoLongerAvailable');
    }
  }

  async buildReportDescription(
    subject,
    prepositionalObject,
    prepositionalObjectTableRowId,
    school,
  ) {
    try {
      const props = await this.getDescriptiveProperties(
        subject,
        prepositionalObject,
        prepositionalObjectTableRowId,
        school,
      );
      return prepositionalObject
        ? this.intl.t('general.reportDisplayDescriptionWithObject', props)
        : this.intl.t('general.reportDisplayDescriptionWithoutObject', props);
    } catch (e) {
      return this.intl.t('general.thisReportIsNoLongerAvailable');
    }
  }

  /**
   * Utility method that powers buildReportDescription() and buildReportTitle()
   */
  async getDescriptiveProperties(
    subject,
    prepositionalObject,
    prepositionalObjectTableRowId,
    school,
  ) {
    const subjectKey = subjectTranslations[subject];
    const subjectTranslation = this.intl.t(subjectKey);

    const schoolTitle = school ? school.title : this.intl.t('general.allSchools');

    if (prepositionalObject) {
      let model = dasherize(prepositionalObject);
      if (model === 'instructor') {
        model = 'user';
      }
      if (model === 'mesh-term') {
        model = 'mesh-descriptor';
      }

      const record = await this.store.findRecord(model, prepositionalObjectTableRowId);
      const objectKey = objectTranslations[prepositionalObject];
      const objectTranslation = this.intl.t(objectKey);
      let object;
      if (model === 'user') {
        object = record.fullName;
      } else if (model === 'mesh-descriptor') {
        object = record.name;
      } else {
        object = record.title;
      }

      let year = '';
      if (model === 'course') {
        const crosses = await this.iliosConfig.itemFromConfig(
          'academicYearCrossesCalendarYearBoundaries',
        );
        year = crosses ? `(${record.year} - ${record.year + 1})` : `(${record.year})`;
      }

      return {
        subject: subjectTranslation,
        object,
        objectType: objectTranslation,
        school: schoolTitle,
        year,
      };
    }

    return {
      subject: subjectTranslation,
      school: schoolTitle,
    };
  }
}
