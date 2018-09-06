import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

module('Integration | Component | offering editor learnergroups', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('service:i18n').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('actions get triggered appropriately', async function(assert) {
    assert.expect(2);

    const group1 = EmberObject.create({
      title: 'Anatomy 1',
      allParentTitles: ['Parent Title']
    });

    const group2 = EmberObject.create({
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

    await render(hbs`{{offering-editor-learnergroups
      cohort=cohort
      learnerGroups=learnerGroups
      addLearnerGroup=(action externalActionAdd)
      removeLearnerGroup=(action externalActionRemove)
    }}`);

    await click('.selectable li:nth-of-type(1)');
    await click('.removable li:nth-of-type(1)');
  });
});
