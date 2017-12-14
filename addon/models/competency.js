import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import DS from 'ember-data';
import Inflector from 'ember-inflector';

const { not } = computed;
const { all } = RSVP;
const { Model, attr, belongsTo, hasMany } = DS;

Inflector.inflector.uncountable('aamc-pcrs');

export default Model.extend({
  title: attr('string'),
  school: belongsTo('school', {async: true}),
  objectives: hasMany('objective', {async: true}),
  parent: belongsTo('competency', {async: true, inverse: 'children'}),
  children: hasMany('competency', {async: true, inverse: 'parent'}),
  aamcPcrses: hasMany('aamc-pcrs', {async: true}),
  programYears: hasMany('program-year', {async: true}),
  isNotDomain: not('isDomain'),
  isDomain: computed('parent', function(){
    const parentId = this.belongsTo('parent').id();
    return !parentId;
  }),

  domain: computed('parent', 'parent.domain', async function() {
    const parent = await this.get('parent');
    if (!parent) {
      return this;
    }
    return await parent.get('domain');
  }),

  treeChildren: computed('children.[]', async function(){
    let rhett = [];
    const children = await this.get('children');
    rhett.pushObjects(children.toArray());

    const trees = await all(children.mapBy('treeChildren'));
    let competencies = trees.reduce((array, set) => {
      return array.pushObjects(set.toArray());
    }, []);
    rhett.pushObjects(competencies);
    return rhett.uniq().filter(item => {
      return !isEmpty(item);
    });
  }),

  childCount: computed('children.[]', function(){
    const childrenIds = this.hasMany('children').ids();
    return childrenIds.length;
  }),
});
