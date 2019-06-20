import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { all } from 'rsvp';

export default Component.extend({
  store: service(),

  classNames: ['school-competencies-expanded'],
  tagName: 'section',

  bufferedCompetencies: null,
  canCreate: false,
  canDelete: false,
  canUpdate: false,
  isManaging: false,
  isSaving: false,
  school: null,

  competencies: computed('school.competencies.[]', async function() {
    const school = this.school;
    return await school.get('competencies');
  }),

  domains: computed('school.competencies.[]', async function() {
    const competencies = await this.competencies;
    return competencies.filterBy('isDomain');
  }),

  childCompetencies: computed('school.competencies.[]', async function() {
    const competencies = await this.competencies;
    return competencies.filterBy('isNotDomain');
  }),

  showCollapsible: computed('isManaging', 'school.competencies.length', function() {
    const isManaging = this.isManaging;
    const school = this.school;
    const competencyIds = school.hasMany('competencies').ids();
    return competencyIds.length && ! isManaging;
  }),

  /**
   * @todo rewrite the component so we don't deal with promises in this lifecycle hook. [ST 2019/01/30]
   */
  async didReceiveAttrs() {
    this._super(...arguments);
    if (this.isManaging && isEmpty(this.bufferedCompetencies)) {
      const school = this.school;
      const competencies  = await school.get('competencies');
      this.set('bufferedCompetencies', competencies.toArray());
    }
  },

  actions: {
    async collapse() {
      const collapse = this.collapse;
      const school = this.school;
      const competencies = await school.get('competencies');
      if (competencies.length) {
        collapse();
      }
    },

    async addCompetencyToBuffer(domain, title) {
      let competency = this.store.createRecord('competency', {title, active: true});
      if (isPresent(domain)) {
        competency.set('parent', domain);
        const children = await domain.get('children');
        children.pushObject(competency);
        this.bufferedCompetencies.pushObject(competency);
      } else {
        this.bufferedCompetencies.pushObject(competency);
      }
    },

    removeCompetencyFromBuffer(competency) {
      let buffer = this.bufferedCompetencies;
      if (buffer.includes(competency)) {
        buffer.removeObject(competency);
      }
    },

    async save() {
      this.set('isSaving', true);
      const setSchoolManageCompetencies = this.setSchoolManageCompetencies;
      const school = this.school;
      const schoolCompetencies = await school.get('competencies');
      const bufferedCompetencies = this.bufferedCompetencies;
      const domainsToRemove = schoolCompetencies.filter(competency => {
        return !bufferedCompetencies.includes(competency) && competency.get('isDomain');
      });
      const competenciesToRemove = schoolCompetencies.filter(competency => {
        return !bufferedCompetencies.includes(competency) && !competency.get('isDomain');
      });

      // delete all removed competencies first, then all removed domains
      await all(competenciesToRemove.invoke('destroyRecord'));
      await all(domainsToRemove.invoke('destroyRecord'));

      // set the school on new competencies
      bufferedCompetencies.filterBy('isNew').forEach(competency => {
        competency.set('school', school);
      });

      // update all modified competencies (this will include new ones).
      await all(
        bufferedCompetencies.filterBy('hasDirtyAttributes').invoke('save')
      );

      // repopulate school from buffer.
      schoolCompetencies.clear();
      bufferedCompetencies.forEach(competency => {
        schoolCompetencies.pushObject(competency);
      });

      // cleanup
      this.set('bufferedCompetencies', []);
      this.set('isSaving', false);
      setSchoolManageCompetencies(false);
    },

    cancel() {
      const setSchoolManageCompetencies = this.setSchoolManageCompetencies;
      setSchoolManageCompetencies(false);
    },

    manage() {
      const setSchoolManageCompetencies = this.setSchoolManageCompetencies;
      setSchoolManageCompetencies(true);
    }
  }
});
