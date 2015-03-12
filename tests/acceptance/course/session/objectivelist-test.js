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

module('Acceptance: Session - Objective List', {
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
  assert.expect(31);
  visit('/course/595/session/16555');
  andThen(function() {
    let objectiveRows = find('.session-objective-list:eq(0) tbody tr');
    assert.equal(objectiveRows.length, 15);
    let expectedTitles = [
      'Describethearticulationsandmovementsattheelbowandwristjoints.',
      'Nameandgivethenervesthatinnervatetwomusclesthatsupinatetheforearmandtwomusclesthatpronatetheforearm.',
      'Namethemusclesthatwouldbeweakenedbydamagetotheaxillarynervebyadislocatedhumeralhead.',
      'Namethemotionsthatwouldbeaffectedbydamagetotheradialnerveintheradialgrooveofthehumerusandresultantmuscleweakness(e.g.,extensionoftheforearm).',
      'Nametwomusclesthatextendthewristwithoutactingonthedigitsandtwomusclesthatflexthewristwithoutactingonthedigits.',
      'Namethemusclesoftheforearmthatflexorextenddigits2-5.',
      'Namethemusclesoftheforearmthatflexorextendthethumbandgivethenervesthatinnervatethemuscles.',
      'Describethepulsepointsofthebrachial,radialandulnararteries.',
      'Describethesynovialjointswhereflexion,extension,adductionandabductionofthedigitsoccur.',
      'Describeordrawthetendonsandnervethatpassthroughthecarpaltunnel.',
      'Describethesensoryandmotorimpairmentsthatonemightseeinapatientwithcarpaltunnelsyndrome.',
      'Describethemotorimpairmentthatresultsfromcuttingtherecurrentbranchofthemediannerve.',
      'Nametheintrinsicmusclesofthehandthatareinnervatedbytheulnarnerve.',
      'DescribehowonewouldquicklytesttheC5,C6,C7,C8andT1myotomes.',
      'DescribehowonewouldquicklytesttheC5,C6,C7,C8andT1dermatomes.'
    ];

    for(let i = 0; i < 15; i++){
      let tds = find('td', objectiveRows.eq(i));
      assert.equal(getText(tds.eq(0)), expectedTitles[i]);
      //the same parent is there for every objective
      assert.equal(getText(tds.eq(1)), 'Describeandexplainthegeneralorganizationofthebodyand,inmoredetail,theanatomyofthemusculoskeletalandnervoussystems,includingselectedfeaturesofembryologicaldevelopment(earlydevelopment,gastrulation,neurulation,segmentation,&developmentofthemusculoskeletalsystem).');
    }

  });
});
