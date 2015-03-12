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

module('Acceptance: Session - Objective Parents', {
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

test('manage parents', function(assert) {
  assert.expect(26);
  visit('/course/595/session/16555');
  andThen(function() {
    let tds = find('.session-objective-list tbody tr:eq(0) td');
    click('a', tds.eq(1));
    assert.equal(getText(find('.detail-specific-title')), 'SelectParentObjectives');
    let objectiveManager = find('.objective-manager').eq(0);
    assert.equal(getText(find('h2', objectiveManager)), 'Describethearticulationsandmovementsattheelbowandwristjoints.');
    andThen(function() {
      let parentPicker = find('.parent-picker', objectiveManager).eq(0);
      let courseObjectives = find('li', parentPicker);
      assert.equal(courseObjectives.length, 23);
      let expectedParents = [
        'Describeandexplainthegeneralorganizationofthebodyand,inmoredetail,theanatomyofthemusculoskeletalandnervoussystems,includingselectedfeaturesofembryologicaldevelopment(earlydevelopment,gastrulation,neurulation,segmentation,&developmentofthemusculoskeletalsystem).',
        'OnthebasisoftheDanoviccase,appreciatewhichdisciplinesareneededtoprovidecomprehensiveandcoordinatedhealthcaretoatraumapatient.',
        'Identifyanatomicalstructuresandtheirrelationshipsonselectedplainfilms,CTscans,ultrasound,andMRI.',
        'Describedifferencesbetweenthenormalandpathologichistologicalappearanceofbasiccells&tissuesincludingneoplasia.',
        'Explainthebasicmechanismsinvolvedintheresponseoftissuetoinjury(inflammationandwoundhealing).',
        'Describethepropertiesandfunctionofbiologicmembranesandmembranetransporters,particularlyastheyrelatetothemovementofdrugswithinorganisms.',
        'Describethegeneralpropertiesofproteinfunctionandregulationparticularlyastheyrelatetotheactionofsignalingmolecules(hormones,neurotransmitters,cytokines)andmajorclassesofdrugs.',
        'Describeandapplybasicprinciplesofpharmacodynamics(theactionofdrugsinbiologicsystems)andpharmacokinetics(theactionofbiologicsystemsupondrugmolecules),focusingondrugsthatinterferewiththeparasympatheticarmoftheANS.',
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

      for(let i=0; i < 23; i++){
        assert.equal(getText(courseObjectives.eq(i)), expectedParents[i]);
      }
    });
  });
});
