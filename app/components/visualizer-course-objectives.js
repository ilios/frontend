import Ember from 'ember';

const { Component, RSVP, computed, isPresent } = Ember;
const { map, filter } = RSVP;

export default Component.extend({
  course: null,
  height: 360,
  width: 360,
  data: [
    { label: 'Abulia', data: [10, 20] },
    { label: 'Betelgeuse', data: [10, 20] },
    { label: 'Cantaloupe', data: [100, 20] },
    { label: 'Dijkstra', data: [10, 20] }
  ],
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
    return courseObjectives.map(courseObjective => {
      const label = courseObjective.get('id');
      const data = sessionCourseObjectiveMap.map(obj => {
        if (obj.objectives.includes(courseObjective.get('id'))) {
          return obj.hours;
        } else {
          return 0;
        }
      });

      return {
        label,
        data
      };
    });
  }),
});
