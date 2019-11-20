import Component from '@ember/component';
import { computed } from '@ember/object';
import { all } from 'rsvp';

export default Component.extend({
  tagName: 'section',
  classNames: ['collapsed-competencies'],
  /**
   * The model object with assigned competencies.
   * Can be either a course or program-year.
   *
   * @property subject
   * @type {Object}
   * @public
   */
  subject: null,

  /**
   * A summary of schools and their competencies that are assigned to the given subject.
   * @property summary
   * @type {Ember.computed}
   * @public
   */
  summary: computed('subject.competencies.[]', async function() {
    const competencies = await this.subject.get('competencies');
    const schools = await all(competencies.mapBy('school'));
    const schoolIds = schools.mapBy('id').uniq();
    return schoolIds.map((id) => {
      return {
        competencies: schools.filterBy('id', id),
        school: schools.findBy('id', id)
      };
    });
  })
});
