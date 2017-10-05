import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
import Ember from 'ember';

moduleForComponent('offering-editor-learnergroups', 'Integration | Component | offering editor learnergroups', {
  integration: true,

  beforeEach() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.register('helper:t', tHelper);
  }
});

test('actions get trigger appropriately', function(assert) {
  assert.expect(2);

  const group1 = Ember.Object.create({
    title: 'Anatomy 1',
    allParentTitles: ['Parent Title']
  });

  const group2 = Ember.Object.create({
    title: 'Anatomy 2',
    allParentTitles: ['Parent Title']
  });

  const learnerGroups = { '12': [ group2, group1 ] };
  const cohort = { id: 12, filteredAvailableLearnerGroups: [{ title: 'BMB 1' }, { title: 'BMB 2' }] };

  this.setProperties({ learnerGroups, cohort });

  const addLearnerGroup = (params) => {
    assert.equal(params.title, 'BMB 1', 'action is triggered with proper argument');
  };

  const removeLearnerGroup = (params) => {
    assert.equal(params.title, 'Anatomy 1', 'action is triggered with proper argument');
  };

  this.setProperties({ externalActionAdd: addLearnerGroup, externalActionRemove: removeLearnerGroup });

  this.render(hbs`{{offering-editor-learnergroups
    cohort=cohort
    learnerGroups=learnerGroups
    addLearnerGroup=(action externalActionAdd)
    removeLearnerGroup=(action externalActionRemove)
  }}`);

  this.$('.selectable li:first').click();
  this.$('.removable li:first').click();
});
