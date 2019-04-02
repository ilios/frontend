import Component from '@ember/component';
import { computed } from '@ember/object';
import { all } from 'rsvp';
import layout from '../templates/components/collapsed-objectives-program-years';

export default Component.extend({
  layout,

  classNames: ['collapsed-objectives-program-years'],
  tagName: 'section',

  subject: null,
  expand() {},

  objectives: computed('subject.objectives.[]', async function() {
    return await this.subject.objectives;
  }),

  objectivesWithCompentency: computed('objectives.[]', async function() {
    const objectives = await this.objectives;
    const promises = objectives.mapBy('competency');
    const competencyArray = await all(promises);
    return competencyArray.filter((competency) => !!competency);
  }),

  objectivesWithMesh: computed('objectives.[]', async function() {
    const objectives = await this.objectives;
    const promises = objectives.mapBy('meshDescriptors');
    const meshDescriptorsArray = await all(promises);
    return meshDescriptorsArray.filter((meshDescriptors) => {
      return meshDescriptors ? meshDescriptors.length > 0 : false;
    });
  })
});
