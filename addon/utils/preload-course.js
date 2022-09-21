import { mapBy } from './array-helpers';

export default async function preloadCourse(store, courseModel) {
  const courses = [courseModel.get('id')];
  const course = courseModel.get('id');
  const school = courseModel.belongsTo('school').id();
  const sessions = courseModel.hasMany('sessions').ids();
  const existingSessionsInStore = store.peekAll('session');
  const existingSessionIds = mapBy(existingSessionsInStore, 'id');
  const unloadedSessions = sessions.filter((id) => !existingSessionIds.includes(id));

  //if we have already loaded all of these sessions we can just proceed normally
  if (unloadedSessions.length === 0) {
    return;
  }

  const promises = [
    store.query('session', { filters: { course } }),
    store.query('offering', { filters: { courses } }),
    store.query('ilm-session', { filters: { courses } }),
    store.query('cohort', { filters: { courses } }),
    store.query('programYear', { filters: { courses } }),
    store.query('program', { filters: { courses } }),
    store.query('course-learning-material', { filters: { course: courses } }),
    store.query('competency', { filters: { school } }),
    store.query('term', { filters: { courses } }),
    store.query('course-objective', { filters: { course } }),
  ];
  const maximumSessionLoad = 100;
  if (sessions.length < maximumSessionLoad) {
    promises.push(store.query('session-type', { filters: { sessions } }));
    promises.push(store.query('term', { filters: { sessions } }));
    promises.push(
      store.query('session-learning-material', {
        filters: { session: sessions },
      })
    );
    promises.push(store.query('session-objective', { filters: { session: sessions } }));
  } else {
    for (let i = 0; i < sessions.length; i += maximumSessionLoad) {
      const slice = sessions.slice(i, i + maximumSessionLoad);
      promises.push(store.query('session-type', { filters: { sessions: slice } }));
      promises.push(store.query('term', { filters: { sessions: slice } }));
      promises.push(
        store.query('session-learning-material', {
          filters: { session: slice },
        })
      );
      promises.push(store.query('session-objective', { filters: { session: slice } }));
    }
  }

  return Promise.all(promises);
}
