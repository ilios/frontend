import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, RSVP, computed, isEmpty, isPresent, String } = Ember;
const { map, filter } = RSVP;
const { htmlSafe } = String;

export default Component.extend({
  course: null,
  height: 360,
  width: 360,
  icon: false,
  classNames: ['visualizer-course-objectives'],
  tagName: 'span',
  objectiveData: computed('course.sessions.[]', 'course.objectives.[]', async function(){
    const course = this.get('course');
    const sessions = await course.get('sessions');
    const sessionCourseObjectiveMap = await map(sessions.toArray(), async session => {
      const hours = await session.get('maxSingleOfferingDuration');
      const sessionObjectives = await session.get('objectives');
      const sessionObjectivesWithParents = await filter(sessionObjectives.toArray(), async sessionObjective => {
        const parents = await sessionObjective.get('parents');
        return isPresent(parents);
      });
      const courseSessionObjectives = await map(sessionObjectivesWithParents.toArray(), sessionObjective => {
        const courseObjective = sessionObjective.get('parents');
        return courseObjective.get('firstObject').get('id');
      });

      return {
        sessionTitle: session.get('title'),
        objectives: courseSessionObjectives,
        hours
      };

    });


    return sessionCourseObjectiveMap;
  }),

  condensedObjectiveData: computed('objectiveData.[]', async function (){
    const course = this.get('course');
    const sessionCourseObjectiveMap  = await this.get('objectiveData');
    const courseObjectives = await course.get('objectives');
    let mappedObjectives = courseObjectives.map(courseObjective => {
      const hours = sessionCourseObjectiveMap.map(obj => {
        if (obj.objectives.includes(courseObjective.get('id'))) {
          return obj.hours;
        } else {
          return 0;
        }
      });
      const sessionObjectives = sessionCourseObjectiveMap.filter(obj => obj.objectives.includes(courseObjective.get('id')));
      const meta = {
        courseObjective,
        sessionObjectives
      };
      const data = hours.reduce((total, hours) => total + parseInt(hours), 0);

      return {
        data,
        meta
      };
    });

    const totalHours = mappedObjectives.mapBy('data').reduce((total, hours) => total + hours, 0);
    const mappedObjectivesWithLabel = mappedObjectives.map(obj => {
      const percent = (obj.data / totalHours * 100).toFixed(1);
      obj.label = `${percent}%`;
      return obj;
    });

    return mappedObjectivesWithLabel;
  }),

  sessionsObjectivesData: computed('objectiveData.[]', async function (){
    const sessionCourseObjectiveMap  = await this.get('objectiveData');

    const mappedDataWithLabel = sessionCourseObjectiveMap.map(({hours, objectives, sessionTitle: label}) => {
      const total = Number(hours);
      const splitHours = total / objectives.length;

      const values = objectives.map(label => {
        return {
          label,
          value: splitHours
        };
      });
      return {
        label,
        total,
        values
      };
    });

    const withValues = mappedDataWithLabel.filter(obj => obj.values.length);

    return withValues;
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
  pieHover: task(function * (obj){
    return yield this.getTooltipData(obj);
  }).restartable(),
  donutHover: task(function * (obj){
    return yield this.getTooltipData(obj);
  }).restartable(),
});
