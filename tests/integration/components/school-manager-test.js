import { moduleForComponent, test } from 'ember-qunit';
import initializer from "ilios/instance-initializers/ember-i18n";
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('school-manager', 'Integration | Component | school manager', {
  integration: true,
  beforeEach(){
    initializer.initialize(this);
  }
});

test('it renders', function(assert) {
  this.on('nothing', parseInt);
  this.render(hbs`{{school-manager
    setSchoolCompetencyDetails=(action 'nothing')
    setSchoolManageCompetencies=(action 'nothing')
    setSchoolVocabularyDetails=(action 'nothing')
    setSchoolLeadershipDetails=(action 'nothing')
    setSchoolManageLeadership=(action 'nothing')
    setSchoolSessionAttributesDetails=(action 'nothing')
    setSchoolManageSessionAttributes=(action 'nothing')
    setSchoolSessionTypeDetails=(action 'nothing')
    setSchoolManagedSessionType=(action 'nothing')
  }}`);

  assert.notEqual(this.$().text().search(/Back to Schools List/), -1);
});
