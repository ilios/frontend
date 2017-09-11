import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, RSVP, computed, isEmpty, isPresent, String:EmberString } = Ember;
const { map, filter } = RSVP;
const { htmlSafe } = EmberString;

export default Component.extend({
  course: null,
  height: 360,
  width: 360,
  icon: false,
  classNameBindings: ['icon::not-icon', ':visualizer-course-objectives'],
  tagName: 'span',
  objectiveData: computed('course.sessions.[]', 'course.objectives.[]', async function(){
    const course = this.get('course');
    const sessions = await course.get('sessions');
    const sessionCourseObjectiveMap = await map(sessions.toArray(), async session => {
      const hours = await session.get('maxSingleOfferingDuration');
      const minutes = Math.round(hours * 60);
      const sessionObjectives = await session.get('objectives');
      const sessionObjectivesWithParents = await filter(sessionObjectives.toArray(), async sessionObjective => {
        const parents = await sessionObjective.get('parents');
        return isPresent(parents);
      });
      const courseSessionObjectives = await map(sessionObjectivesWithParents.toArray(), async sessionObjective => {
        const parents = await sessionObjective.get('parents');
        return parents.mapBy('id');
      });
      let flatObjectives = courseSessionObjectives.reduce((flattened, obj) => {
        return flattened.pushObjects(obj.toArray());
      }, []);

      return {
        sessionTitle: session.get('title'),
        objectives: flatObjectives,
        minutes
      };

    });


    return sessionCourseObjectiveMap;
  }),

  condensedObjectiveData: computed('objectiveData.[]', async function (){
    const course = this.get('course');
    const sessionCourseObjectiveMap  = await this.get('objectiveData');
    const courseObjectives = await course.get('objectives');
    let mappedObjectives = courseObjectives.map(courseObjective => {
      const minutes = sessionCourseObjectiveMap.map(obj => {
        if (obj.objectives.includes(courseObjective.get('id'))) {
          return obj.minutes;
        } else {
          return 0;
        }
      });
      const sessionObjectives = sessionCourseObjectiveMap.filter(obj => obj.objectives.includes(courseObjective.get('id')));
      const meta = {
        courseObjective,
        sessionObjectives
      };
      const data = minutes.reduce((accumulator, current) => accumulator + parseInt(current), 0);

      return {
        data,
        meta
      };
    });

    const totalMinutes = mappedObjectives.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    const mappedObjectivesWithLabel = mappedObjectives.map(obj => {
      const percent = (obj.data / totalMinutes * 100).toFixed(1);
      obj.label = `${percent}%`;
      return obj;
    });

    return mappedObjectivesWithLabel;
  }),

  objectiveWithMinutes: computed('condensedObjectiveData.[]', async function(){
    const condensedObjectiveData = await this.get('condensedObjectiveData');
    const objectiveWithMinutes = condensedObjectiveData.filter(obj => obj.data !== 0);

    return objectiveWithMinutes;
  }),

  objectiveWithoutMinutes: computed('condensedObjectiveData.[]', async function(){
    const condensedObjectiveData = await this.get('condensedObjectiveData');
    const objectiveWithoutMinutes = condensedObjectiveData.filterBy('data', 0);

    return objectiveWithoutMinutes;
  }),

  async getTooltipData(obj){
    const icon = this.get('icon');
    if (icon || isEmpty(obj) || obj.empty) {
      return '';
    }
    const { meta } = obj;

    let objectiveTitle = meta.courseObjective.get('title');
    let competency = await meta.courseObjective.get('competency');
    if (competency) {
      objectiveTitle += `(${competency})`;
    }

    const title = htmlSafe(objectiveTitle);
    const sessionTitles = meta.sessionObjectives.mapBy('sessionTitle');
    const content = sessionTitles.join(', ');

    return {
      content,
      title
    };
  },
  donutHover: task(function * (obj){
    return yield this.getTooltipData(obj);
  }).restartable(),
});
