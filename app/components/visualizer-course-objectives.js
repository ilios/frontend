/* global d3 */
import Ember from 'ember';

const { Component, RSVP, computed, isPresent } = Ember;
const { map, filter } = RSVP;

export default Component.extend({
  course: null,
  size: {
    height: 340,
    width: 900
  },
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
    const courseObjectives = await course.get('objectives');
    let columns = courseObjectives.map(courseObjective => {
      const title = courseObjective.get('id');
      const hoursSpent = sessionCourseObjectiveMap.map(obj => {
        if (obj.objectives.includes(courseObjective.get('id'))) {
          return obj.hours;
        } else {
          return 0;
        }
      });

      let data = [title];
      data.pushObjects(hoursSpent);

      return data;
    });
    // let groups = courseObjectives.mapBy('id');
    let order = 'desc';

    return {
      columns,
      order
    };
  }),
  tooltip: {
    format: {
      title: function(d) {
        return 'Session ' + d;
      },
      value: function(value, ratio, id) {
        let format = id === 'data1' ? d3.format(',') : d3.format('');
        return format(value);
      }
    }
  },
  padding: {
    top: 30,
    right: 0,
    bottom: 10,
    left: 60,
  },
});
