import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | detail learnergroups list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const set1 = 'fieldset:nth-of-type(1)';
    const set1Legend = set1 + ' legend';
    const set1Group1 = set1 + ' li:nth-of-type(1)';
    const set1Group2 = set1 + ' li:nth-of-type(2)';
    const set1Group3 = set1 + ' li:nth-of-type(3)';

    const set2 = 'fieldset:nth-of-type(2)';
    const set2Legend = set2 + ' legend';
    const set2Group1 = set2 + ' li:nth-of-type(1)';
    const set2Group2 = set2 + ' li:nth-of-type(2)';

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

    await render(hbs`{{detail-learnergroups-list learnerGroups=learnerGroups remove=(action nothing)}}`);
    await settled();

    assert.equal(find(set1Legend).textContent.trim(), 'tlg1 ( )');
    assert.equal(find(set1Group1).textContent.trim(), 'tlg1 (2)');
    assert.equal(find(set1Group2).textContent.trim(), 'sub group 1 (3)');
    assert.equal(find(set1Group3).textContent.trim().replace(/[\n\s]+/g, ''), 'subsubgroup1(1)');

    assert.equal(find(set2Legend).textContent.trim(), 'tlg2 ( )');
    assert.equal(find(set2Group1).textContent.trim(), 'tlg2 (2)');
    assert.equal(find(set2Group2).textContent.trim(), 'sub group 2 (0)');
  });
});
