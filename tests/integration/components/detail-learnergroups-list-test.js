import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { Object, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('detail-learnergroups-list', 'Integration | Component | detail learnergroups list', {
  integration: true
});

test('it renders', function(assert) {
  const set1 = 'fieldset:eq(0)';
  const set1Legend = set1 + ' legend';
  const set1Group1 = set1 + ' li:eq(0)';
  const set1Group2 = set1 + ' li:eq(1)';
  const set1Group3 = set1 + ' li:eq(2)';

  const set2 = 'fieldset:eq(1)';
  const set2Legend = set2 + ' legend';
  const set2Group1 = set2 + ' li:eq(0)';

  let tlg1 = Object.create({
    allParentTitles: [],
    title: 'tlg1',
  });
  tlg1.set('topLevelGroup', resolve(tlg1));
  let subGroup1 = Object.create({
    allParentTitles: ['tlg1'],
    topLevelGroup: resolve(tlg1),
    title: 'sub group 1'
  });
  let subSubGroup1 = Object.create({
    allParentTitles: ['tlg1', 'sub group 1'],
    topLevelGroup: resolve(tlg1),
    title: 'sub sub group 1'
  });
  let tlg2 = Object.create({
    allParentTitles: [],
    title: 'tlg2'
  });
  tlg2.set('topLevelGroup', resolve(tlg2));
  let subGroup2 = Object.create({
    topLevelGroup: resolve(tlg2),
    allParentTitles: ['tlg2'],
    title: 'sub group 2',
  });

  this.set('learnerGroups', [tlg1, subGroup1, subSubGroup1, subGroup2]);

  this.render(hbs`{{detail-learnergroups-list learnerGroups=learnerGroups}}`);

  assert.equal(this.$(set1Legend).text().trim(), 'tlg1 ( )');
  assert.equal(this.$(set1Group1).text().trim(), 'tlg1');
  assert.equal(this.$(set1Group2).text().trim(), 'sub group 1');
  assert.equal(this.$(set1Group3).text().trim().replace(/[\n\s]+/g, ''), 'subgroup1subsubgroup1');

  assert.equal(this.$(set2Legend).text().trim(), 'tlg2 ( )');
  assert.equal(this.$(set2Group1).text().trim(), 'sub group 2');
});
