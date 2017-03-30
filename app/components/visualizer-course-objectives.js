import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, RSVP, computed, isPresent, $ } = Ember;
const { map, filter } = RSVP;

export default Component.extend({
  course: null,
  height: 360,
  width: 360,
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
  displayTooltip: task(function * ({meta}, slice, labelLocation){
    let objectiveTitle = meta.courseObjective.get('title');
    let competency = yield meta.courseObjective.get('competency');
    if (competency) {
      objectiveTitle += `(${competency})`;
    }
    this.set('tooltipValue', objectiveTitle);
    let svg_parent = $(slice.nearestViewportElement);
    let svg_offset = $(svg_parent).offset();
    let svg_parent_offset = $(svg_parent).parent().offsetParent().offset();
    let svg_dimension = {
      width: $(svg_parent).width(),
      height: $(svg_parent).height(),
    };

    const tooltip_width = 380;

    let tooltip_top = svg_offset.top - svg_parent_offset.top + svg_dimension.height / 2 + labelLocation[1] + 20;
    let tooltip_left = Math.max(0 ,svg_offset.left - svg_parent_offset.left + svg_dimension.width / 2 - tooltip_width / 2 + labelLocation[0]);

    this.set('tooltipLocation', 'top:' + tooltip_top + 'px; left:' + tooltip_left + 'px;');
  }).restartable(),
  actions: {
    hideTooltip(){
      this.set('tooltipValue', null);
    }
  }
});
