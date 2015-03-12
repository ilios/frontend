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

module('Acceptance: Course - Objective List', {
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
  assert.expect(47);
  visit('/course/595?details=true');
  andThen(function() {
    let objectiveRows = find('.course-objective-list tbody tr');
    assert.equal(objectiveRows.length, 23);
    let expectedTitles = [
      'Describeandexplainthegeneralorganizationofthebodyand,inmoredetail,theanatomyofthemusculoskeletalandnervoussystems,includingselectedfeaturesofembryologicaldevelopment(earlyd',
      'OnthebasisoftheDanoviccase,appreciatewhichdisciplinesareneededtoprovidecomprehensiveandcoordinatedhealthcaretoatraumapatient.',
      'Identifyanatomicalstructuresandtheirrelationshipsonselectedplainfilms,CTscans,ultrasound,andMRI.',
      'Describedifferencesbetweenthenormalandpathologichistologicalappearanceofbasiccells&tissuesincludingneoplasia.',
      'Explainthebasicmechanismsinvolvedintheresponseoftissuetoinjury(inflammationandwoundhealing).',
      'Describethepropertiesandfunctionofbiologicmembranesandmembranetransporters,particularlyastheyrelatetothemovementofdrugswithinorganisms.',
      'Describethegeneralpropertiesofproteinfunctionandregulationparticularlyastheyrelatetotheactionofsignalingmolecules(hormones,neurotransmitters,cytokines)andmajorclassesofdrugs.',
      'Describeandapplybasicprinciplesofpharmacodynamics(theactionofdrugsinbiologicsystems)andpharmacokinetics(theactionofbiologicsystemsupondrugmolecules),focusingondrugsthatinte',
      'Contrastanddifferentiateindividualandpopulationhealthissues.',
      'Describetheclinicalprinciplesusedintheevaluationoftraumapatients.',
      'Describehowbias,behavior,socioeconomicstatusandcultureinfluencehealthanddisease.',
      'Describethebiopsychosocialmodelandbeabletoapplythismodeltoclinicalcasescenarios.',
      'Describethebasicprinciplesofgeneexpression,geneticvariationandinheritanceandexaminetheimplicationofgeneticvariationinmedicine.',
      'Synthesizeandsummarizeinformationforbenefitofpeers.',
      'Explainthemeaningandroleofcompetencies,astheyrelatetoyouradvancementinmedicalschoolanddescribeasetofcompetenciesthatarebestmaturedinthecontextofsmallgrouplearning.',
      'Criticallyreflectonone\'sownperformancetoidentifystrengthsandchallenges,setindividuallearningandimprovementgoals,andengageinappropriatelearningactivitiestomeetthosegoals',
      'Employstrategiesforseekingandincorporatingfeedbackfromallavailableresources',
      'Showaccountabilityandreliabilityininteractionswithpeers,facultymembers,patients,families,andotherhealthprofessionals',
      'Describethecomponentsofatypicalhospitalbill,thegeneraltypesofhealthcarecoveragethatmightcoverthesecharges,andtheconceptof“costshifting”.',
      'DocumentprofessionalandpersonaldevelopmentinrelationtotheUCSFMDCompetencymilestones.',
      'Demonstratecuriosity,objectivity,andtheuseofscientificreasoninginacquisitionofknowledge,andinapplyingittopatientcare.',
      'Describetheanatomicalrelationshipsneededtoperformandavoidcomplicationsofavarietyofprocedures.',
      'Describenormalimmunologicalresponsestopathogensandhowtheimmunesystemcancausedisease.',
    ];

    let expectedParents = [
      'Establishandmaintainknowledgenecessaryforthepreventivecare,diagnosis,treatment,andmanagementofmedicalproblems.(KnowledgeforPractice)',
      'Participateeffectivelyasamemberofthehealthcareteamwithphysiciansandinterprofessionalhealthcareproviders(HealthcareDeliverySystems)',
      'Select,justifyandinterpretdiagnosticclinicaltestsandimaging(Problem-SolvingandDiagnosis)',
      'Establishandmaintainknowledgenecessaryforthepreventivecare,diagnosis,treatment,andmanagementofmedicalproblems.(KnowledgeforPractice)',
      'Establishandmaintainknowledgenecessaryforthepreventivecare,diagnosis,treatment,andmanagementofmedicalproblems.(KnowledgeforPractice)',
      'Demonstratecuriosity,objectivity,andtheuseofscientificreasoninginacquisitionofknowledge,andinapplyingittopatientcare.(KnowledgeforPractice)',
      'Establishandmaintainknowledgenecessaryforthepreventivecare,diagnosis,treatment,andmanagementofmedicalproblems.(KnowledgeforPractice)',
      'Establishandmaintainknowledgenecessaryforthepreventivecare,diagnosis,treatment,andmanagementofmedicalproblems.(KnowledgeforPractice)',
      'Establishandmaintainknowledgenecessaryforthepreventivecare,diagnosis,treatment,andmanagementofmedicalproblems.(KnowledgeforPractice)',
      'Conductrelevant,complete,andfocusedphysicalexaminations(PhysicalExam)',
      'Formdoctor-patientrelationshipsdemonstratingsensitivityandresponsivenesstoculture,race/ethnicity,age,socioeconomicstatus,gender,sexualorientation,spirituality,disabilities,andotheraspectsofdiversityandidentity,andadvocateforcarefortheunderserved(ProfessionalRelationships)',
      'Elicitandaddresspatients\'concerns,needsandpreferencesandincorporatethemintomanagementplans(CommunicationandInformationSharingwithPatientsandFamilies)',
      'Demonstratecuriosity,objectivity,andtheuseofscientificreasoninginacquisitionofknowledge,andinapplyingittopatientcare.(KnowledgeforPractice)',
      'Communicateoralandwrittenclinicalinformationthataccuratelyandefficientlysummarizespatientdata(CommunicationwiththeMedicalTeam)',
      'Criticallyreflectonone\'sownperformancetoidentifystrengthsandchallenges,setindividuallearningandimprovementgoals,andengageinappropriatelearningactivitiestomeetthosegoals(ReflectionandSelf-Improvement)',
      'Criticallyreflectonone\'sownperformancetoidentifystrengthsandchallenges,setindividuallearningandimprovementgoals,andengageinappropriatelearningactivitiestomeetthosegoals(ReflectionandSelf-Improvement)',
      'Employstrategiesforseeking,incorporating,anddeliveringfeedback(ReflectionandSelf-Improvement)',
      'Demonstraterespect,compassion,accountability,dependability,andintegritywheninteractingwithpeers,interprofessionalhealthcareproviders,patients,andfamilies(ProfessionalRelationships)',
      'Understandbasicprinciplesofhealthcaredelivery,organizationandfinance,howcostsaffecthealthcaredelivery,andincentivesmethodsforcontrollingcosts(HealthcareDeliverySystems)',
      'DocumentprofessionalandpersonaldevelopmentinrelationtotheUCSFMDCompetencymilestones(ReflectionandSelf-Improvement)',
      'Demonstratecuriosity,objectivity,andtheuseofscientificreasoninginacquisitionofknowledge,andinapplyingittopatientcare.(KnowledgeforPractice)',
      'Establishandmaintainknowledgenecessaryforthepreventivecare,diagnosis,treatment,andmanagementofmedicalproblems.(KnowledgeforPractice)',
      'Establishandmaintainknowledgenecessaryforthepreventivecare,diagnosis,treatment,andmanagementofmedicalproblems.(KnowledgeforPractice)',
    ];

    for(let i = 0; i < 23; i++){
      let tds = find('td', objectiveRows.eq(i));
      assert.equal(getText(tds.eq(0)), expectedTitles[i]);
      assert.equal(getText(tds.eq(1)), expectedParents[i]);
    }

  });
});
