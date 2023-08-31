import Service, { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize, dasherize } from '@ember/string';
import striptags from 'striptags';
import { mapBy, sortBy } from 'ilios-common/utils/array-helpers';
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

  async instructorsArrayResults(report) {
    const filters = await this.#getFilters(report);
    const attributes = ['id', 'firstName', 'middleName', 'lastName', 'displayName'];
    const result = await this.graphql.find('users', filters, attributes.join(','));
    const names = result.data.users
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

    return [[this.intl.t('general.instructors')]].concat(names);
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
    let terms = await this.store.query('term', {
      filters: {
        ids: [result.data.terms.map(({ id }) => id)],
      },
    });
    const titles = map(terms.slice(), async (term) => {
      const vocabulary = await term.get('vocabulary');
      const titleWithParentTitles = await term.getTitleWithParentTitles();
      return vocabulary.title + ' > ' + titleWithParentTitles;
    }).sort();
    return [[this.intl.t('general.vocabulary')]].concat(titles);
  }

  async buildReportTitle(report) {
    try {
      const props = await this.getDescriptiveProperties(report);
      return report.prepositionalObject
        ? this.intl.t('general.reportDisplayTitleWithObject', props)
        : this.intl.t('general.reportDisplayTitleWithoutObject', props);
    } catch (e) {
      return this.intl.t('general.thisReportIsNoLongerAvailable');
    }
  }

  async buildReportDescription(report) {
    try {
      const props = await this.getDescriptiveProperties(report);
      return report.prepositionalObject
        ? this.intl.t('general.reportDisplayDescriptionWithObject', props)
        : this.intl.t('general.reportDisplayDescriptionWithoutObject', props);
    } catch (e) {
      return this.intl.t('general.thisReportIsNoLongerAvailable');
    }
  }

  /**
   * Utility method that powers buildReportDescription() and buildReportTitle()
   * @throws Exception
   * @return Object
   */
  async getDescriptiveProperties(report) {
    const subject = report.subject;
    const subjectKey = subjectTranslations[subject];
    const subjectTranslation = this.intl.t(subjectKey);
    const prepositionalObject = report.prepositionalObject;

    const school = await report.school;
    const schoolTitle = school ? school.title : this.intl.t('general.allSchools');

    if (prepositionalObject) {
      let model = dasherize(prepositionalObject);
      if (model === 'instructor') {
        model = 'user';
      }
      if (model === 'mesh-term') {
        model = 'mesh-descriptor';
      }

      const prepositionalObjectTableRowId = report.get('prepositionalObjectTableRowId');

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
