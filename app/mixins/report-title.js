import Ember from 'ember';

const { inject } = Ember;
const { service } = inject;


export default Ember.Mixin.create({
  i18n: service(),
  store: service(),
  report: null,

  async getReportTitle(report){
    const title = report.get('title');
    if (title) {
      return title;
    }
    const i18n = this.get('i18n');
    const store = this.get('store');
    const subject = report.get('subject');
    const subjectTranslation = i18n.t(this.subjectTranslations[subject]);
    const prepositionalObject = report.get('prepositionalObject');

    const school = await report.get('school');
    const schoolTitle = school?school.get('title'):i18n.t('general.allSchools');

    if (prepositionalObject) {
      let model = prepositionalObject.dasherize();
      if(model === 'instructor'){
        model = 'user';
      }
      if(model === 'mesh-term'){
        model = 'mesh-descriptor';
      }
      const prepositionalObjectTableRowId = report.get('prepositionalObjectTableRowId');

      let record;
      try {
        record = await store.findRecord(model, prepositionalObjectTableRowId);
      } catch (e) {
        return '';
      }

      let object;
      if(model === 'user'){
        object = record.get('fullName');
      } else if(model === 'mesh-descriptor'){
        object = record.get('name');
      } else {
        object = record.get('title');
      }

      return i18n.t('general.reportDisplayTitleWithObject', {
        subject: subjectTranslation,
        object,
        school: schoolTitle
      });
    }

    return i18n.t('general.reportDisplayTitleWithoutObject', {
      subject: subjectTranslation,
      school: schoolTitle
    });
  },
  subjectTranslations: {
    'course': 'general.courses',
    'session': 'general.sessions',
    'program': 'general.programs',
    'program year': 'general.programYears',
    'instructor': 'general.instructors',
    'instructor group': 'general.instructorGroups',
    'learning material': 'general.learningMaterials',
    'competency': 'general.competencies',
    'mesh term': 'general.meshTerms',
    'term': 'general.terms',
    'session type': 'general.sessionTypes',
  },
});
