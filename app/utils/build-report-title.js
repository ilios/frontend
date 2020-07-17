export default async function buildReportTitle(report, store, intl) {
  const title = report.title;
  if (title) {
    return title;
  }
  const subject = report.subject;
  const key = subjectTranslations[subject];
  const subjectTranslation = intl.t(key);
  const prepositionalObject = report.prepositionalObject;

  const school = await report.school;
  const schoolTitle = school?school.get('title'):intl.t('general.allSchools');

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
      return intl.t('general.thisReportIsNoLongerAvailable');
    }

    let object;
    if(model === 'user'){
      object = record.fullName;
    } else if(model === 'mesh-descriptor'){
      object = record.name;
    } else {
      object = record.title;
    }

    return intl.t('general.reportDisplayTitleWithObject', {
      subject: subjectTranslation,
      object,
      school: schoolTitle
    });
  }

  return intl.t('general.reportDisplayTitleWithoutObject', {
    subject: subjectTranslation,
    school: schoolTitle
  });
}

const subjectTranslations = {
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
};
