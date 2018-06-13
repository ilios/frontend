/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  i18n: service(),
  programYear: null,
  isIcon: false,
  classNameBindings: ['isIcon::not-icon', ':visualizer-program-year-competencies'],
  tooltip: null,
  programYearName: computed('programYear.acdemicYear', 'programYear.cohort.{title,classOfYear}', async function(){
    const i18n = this.get('i18n');
    const programYear = this.get('programYear');
    const cohort = await programYear.get('cohort');
    const title = cohort.get('title');
    const classOfYear = i18n.t('classOfYear', { year: programYear.get('classOfYear') });

    return title ? title : classOfYear;
  }),
  data: computed('programYear.competencies.[]', async function(){
    const programYear = this.get('programYear');
    const name = await this.get('programYearName');
    const buildTree = async function(parent) {
      const children = await parent.get('children');
      const childrenTree = await map(children.toArray(), buildTree);

      const rhett = {
        name: parent.get('title'),
        children: childrenTree
      };

      return rhett;
    };
    const objectives = await programYear.get('objectives');
    const objetiveObjects = await map(objectives.toArray(), async objective => {
      const obj = await buildTree(objective);
      const competency = await objective.get('competency');
      const domain = await competency.get('domain');
      obj.meta = {
        domainId: domain.get('id'),
        domainTitle: domain.get('title'),
        competencyId: competency.get('id'),
        competencyTitle: competency.get('title'),
      };

      return obj;
    });

    const competencyObjects = objetiveObjects.reduce((set, obj) => {
      let existing = set.findBy('name', obj.meta.competencyTitle);
      if (!existing) {
        existing = {
          children: [],
          name: obj.meta.competencyTitle,
          meta: {
            id: obj.meta.competencyId,
            domainTitle: obj.meta.domainTitle,
            domainId: obj.meta.domainId,
          }
        };
        set.pushObject(existing);
      }
      existing.children.pushObject(obj);

      return set;
    }, []);

    const children = competencyObjects.reduce((set, obj) => {
      let existing = set.findBy('name', obj.meta.domainTitle);
      if (!existing) {
        existing = {
          children: [],
          name: obj.meta.domainTitle,
        };
        set.pushObject(existing);
      }
      //if the domain and the competency are the same
      if (obj.meta.id === obj.meta.domainId) {
        existing.children.pushObjects(obj.children);
      } else {
        existing.children.pushObject(obj);
      }

      return set;
    }, []);

    return {
      name,
      children
    };
  }),
  nodeHover: task(function* (obj) {
    yield timeout(100);
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      this.set('tooltip', null);
      return;
    }

    this.set('tooltip', htmlSafe(obj.name));
  }).restartable()
});
