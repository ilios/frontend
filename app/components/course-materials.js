import Ember from 'ember';
import SortableTable from 'ilios/mixins/sortable-table';

const { Component, RSVP, Object:EmberObject, computed, isEmpty, isPresent } = Ember;
const { Promise, map } = RSVP;

export default Component.extend(SortableTable, {
  course: null,
  sortBy: null,
  classNames: ['course-materials'],
  typesWithUrl: ['file', 'link'],
  filter: '',
  sessionLearningMaterials: computed('course.sessions.[]', function(){
    const course = this.get('course');
    return new Promise(resolve => {
      course.get('sessions').then(sessions => {
        map(sessions.toArray(), session => {
          return session.get('learningMaterials');
        }).then(learningMaterials => {
          let flat = learningMaterials.reduce((flattened, obj) => {
            return flattened.pushObjects(obj.toArray());
          }, []);

          resolve(flat);
        });
      });
    });
  }),
  sessionLearningMaterialObjects: computed('sessionLearningMaterials.[]', function(){
    return new Promise(resolve =>{
      this.get('sessionLearningMaterials').then(slms => {
        map(slms.toArray(), sessionLearningMaterial => {
          return new Promise(resolve =>{
            sessionLearningMaterial.get('learningMaterial').then(learningMaterial => {
              sessionLearningMaterial.get('session').then(session => {
                session.get('firstOfferingDate').then(firstOfferingDate => {
                  let obj = EmberObject.create({
                    title: learningMaterial.get('title'),
                    description: learningMaterial.get('description'),
                    author: learningMaterial.get('originalAuthor'),
                    type: learningMaterial.get('type'),
                    url: learningMaterial.get('url'),
                    citation: learningMaterial.get('citation'),
                    sessionTitle: session.get('title'),
                    firstOfferingDate,
                  });
                  resolve(obj);
                });
              });
            });
          });
        }).then(lmObjects => {
          resolve(lmObjects);
        });
      });
    });
  }),
  filteredSessionLearningMaterialObjects: computed('filter', 'sessionLearningMaterialObjects.[]', function(){
    return new Promise(resolve => {
      this.get('sessionLearningMaterialObjects').then(objs => {
        const filter = this.get('filter');
        if (isEmpty(filter)) {
          resolve(objs);
        } else {
          let exp = new RegExp(filter, 'gi');
          let filteredObjs = objs.filter(obj => {
            return (isPresent(obj.get('title')) && obj.get('title').match(exp)) ||
                   (isPresent(obj.get('description')) && obj.get('description').match(exp)) ||
                   (isPresent(obj.get('author')) && obj.get('author').match(exp)) ||
                   (isPresent(obj.get('type')) && obj.get('type').match(exp)) ||
                   (isPresent(obj.get('citation')) && obj.get('citation').match(exp)) ||
                   (isPresent(obj.get('sessionTitle')) && obj.get('sessionTitle').match(exp));
          });

          resolve(filteredObjs);
        }
      });
    });
  }),
  sessions: computed('course.sessions.[]', function(){
    const course = this.get('course');
    return new Promise(resolve => {
      course.get('sessions').then(sessions => {
        map(sessions.toArray(), session => {
          return session.get('learningMaterials');
        }).then(learningMaterials => {
          let flat = learningMaterials.reduce((flattened, obj) => {
            return flattened.pushObjects(obj.toArray());
          }, []);

          resolve(flat);
        });
      });
    });
  }),
  courseLearningMaterialObjects: computed('course.learningMaterials.[]', function(){
    return new Promise(resolve =>{
      const course = this.get('course');
      course.get('learningMaterials').then(clms => {
        map(clms.toArray(), courseLearningMaterial => {
          return new Promise(resolve =>{
            courseLearningMaterial.get('learningMaterial').then(learningMaterial => {
              let obj = EmberObject.create({
                title: learningMaterial.get('title'),
                description: learningMaterial.get('description'),
                author: learningMaterial.get('originalAuthor'),
                type: learningMaterial.get('type'),
                url: learningMaterial.get('url'),
                citation: learningMaterial.get('citation'),
              });
              resolve(obj);
            });
          });
        }).then(lmObjects => {
          resolve(lmObjects);
        });
      });
    });
  }),
});
