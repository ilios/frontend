import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('detail-learnergroups-list', 'Integration | Component | detail learnergroups list', {
  integration: true
});

test('it renders', async function(assert) {
  const set1 = 'fieldset:eq(0)';
  const set1Legend = set1 + ' legend';
  const set1Group1 = set1 + ' li:eq(0)';
  const set1Group2 = set1 + ' li:eq(1)';
  const set1Group3 = set1 + ' li:eq(2)';

  const set2 = 'fieldset:eq(1)';
  const set2Legend = set2 + ' legend';
  const set2Group1 = set2 + ' li:eq(0)';
  const set2Group2 = set2 + ' li:eq(1)';

  let tlg1 = EmberObject.create({
    allParentTitles: [],
    title: 'tlg1',
    hasMany(){
      return {
        ids(){
          return [1,2];
        }
      };
    }
  });
  tlg1.set('topLevelGroup', resolve(tlg1));
  let subGroup1 = EmberObject.create({
    allParentTitles: ['tlg1'],
    topLevelGroup: resolve(tlg1),
    title: 'sub group 1',
    hasMany(){
      return {
        ids(){
          return [1, 2, 3];
        }
      };
    }
  });
  let subSubGroup1 = EmberObject.create({
    allParentTitles: ['tlg1', 'sub group 1'],
    topLevelGroup: resolve(tlg1),
    title: 'sub sub group 1',
    hasMany(){
      return {
        ids(){
          return [1];
        }
      };
    }
  });
  let tlg2 = EmberObject.create({
    allParentTitles: [],
    title: 'tlg2',
    hasMany(){
      return {
        ids(){
          return [1,2];
        }
      };
    }
  });
  tlg2.set('topLevelGroup', resolve(tlg2));
  let subGroup2 = EmberObject.create({
    topLevelGroup: resolve(tlg2),
    allParentTitles: ['tlg2'],
    title: 'sub group 2',
    hasMany(){
      return {
        ids(){
          return [];
        }
      };
    }
  });

  tlg1.set('allDescendants', resolve([subGroup1, subSubGroup1]));
  subGroup1.set('allDescendants', resolve([subSubGroup1]));
  subSubGroup1.set('allDescendants', resolve([]));
  tlg2.set('allDescendants', resolve([subGroup2]));
  subGroup2.set('allDescendants', resolve([]));


  this.set('learnerGroups', [tlg1, subGroup1, subSubGroup1, subGroup2]);
  this.set('nothing', parseInt);

  this.render(hbs`{{detail-learnergroups-list learnerGroups=learnerGroups remove=(action nothing)}}`);
  await wait();

  assert.equal(this.$(set1Legend).text().trim(), 'tlg1 ( )');
  assert.equal(this.$(set1Group1).text().trim(), 'tlg1 (2)');
  assert.equal(this.$(set1Group2).text().trim(), 'sub group 1 (3)');
  assert.equal(this.$(set1Group3).text().trim().replace(/[\n\s]+/g, ''), 'subsubgroup1(1)');

  assert.equal(this.$(set2Legend).text().trim(), 'tlg2 ( )');
  assert.equal(this.$(set2Group1).text().trim(), 'tlg2 (2)');
  assert.equal(this.$(set2Group2).text().trim(), 'sub group 2 (0)');
});
