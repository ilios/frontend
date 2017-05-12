import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Helper, inject } = Ember;
const { service } = inject;

export default Helper.extend({
  i18n: service(),
  store: service(),
  reportTitle: null,
  compute([report]) {
    const reportTitle = this.get('reportTitle');
    if (reportTitle) {
      return reportTitle;
    }
    this.get('loadTitle').perform(report);
  },
  /**
  * Done as a task so we don't call set on the destroyed Helper
  * if the template is taken out of the DOM while the promise is still resolving
  **/
  loadTitle: task(function * (report) {
    const title = yield this.getReportTitle(report);
    this.set('reportTitle', title);
    this.recompute();
  }).restartable(),
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
      const record = await store.findRecord(model, prepositionalObjectTableRowId);
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
