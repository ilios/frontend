import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import startServer from 'ilios/tests/helpers/start-server';
import mockCurrentUser from 'ilios/tests/helpers/mock-currentuser';

var application;
var server;

module('Acceptance: Course - Objective Parents', {
  beforeEach: function() {
    mockCurrentUser(4136);
    application = startApp();
    server = startServer();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
    server.shutdown();
  }
});

test('list objectives', function(assert) {
  assert.expect(50);
  visit('/course/595?details=true');
  andThen(function() {
    let tds = find('.course-objective-list tbody tr:eq(0) td');
    click('a', tds.eq(1));
    assert.equal(getText(find('.detail-specific-title')), 'SelectParentObjectives');
    let objectiveManager = find('.objective-manager').eq(0);
    assert.equal(getText(find('h2', objectiveManager)), 'Describeandexplainthegeneralorganizationofthebodyand,inmoredetail,theanatomyofthemusculoskeletalandnervoussystems,includingselectedfeaturesofembryologicaldevelopment(earlydevelopment,gastrulation,neurulation,segmentation,&developmentofthemusculoskeletalsystem).');
    andThen(function() {
      assert.equal(getText(find('.group-picker', objectiveManager)), 'SelectParentFor:DoctorofMedicineClassof2018');
      let parentPicker = find('.parent-picker', objectiveManager).eq(0);
      let competencies = find('.competency-title', parentPicker);
      assert.equal(competencies.length, 23);
      let expectedCompetencies = [
        'BoundariesandPriorities',
        'CommunicationandInformationSharingwithPatientsandFamilies',
        'CommunicationwiththeMedicalTeam',
        'Doctor-PatientRelationship',
        'EthicalPrinciples',
        'Evidence-BasedMedicine',
        'HealthcareDeliverySystems',
        'HistoryTaking',
        'InformationManagement',
        'InquiryandDiscovery',
        'Institutional,Regulatory,andProfessionalSocietyStandards',
        'KnowledgeforPractice',
        'MedicalNotes',
        'OralCasePresentation',
        'PatientManagement',
        'PhysicalExam',
        'Problem-SolvingandDiagnosis',
        'ProceduresandSkills',
        'ProfessionalRelationships',
        'ReflectionandSelf-Improvement',
        'SystemsImprovement',
        'Treatment',
        'WorkHabits,Appearance,andEtiquette',
      ];
      let objectiveCountForCompetency = [
        1,
        5,
        3,
        1,
        1,
        3,
        2,
        1,
        1,
        1,
        1,
        2,
        1,
        1,
        3,
        1,
        2,
        2,
        2,
        3,
        1,
        1,
        1,
      ];
      for(let i=0; i < 23; i++){
        let ul = find('ul', parentPicker).eq(i);
        assert.equal(getText(competencies.eq(i)), expectedCompetencies[i]);
        assert.equal(find('li', ul).length, objectiveCountForCompetency[i]);
      }
    });
  });
});
