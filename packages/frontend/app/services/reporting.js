import Service, { service } from '@ember/service';
import { dasherize } from '@ember/string';

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
