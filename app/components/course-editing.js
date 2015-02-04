import Ember from 'ember';

export default Ember.Component.extend({
  availableTopics: [],
  actions: {
    save: function(){
      var self = this;
      var course = this.get('course');
      course.save().then(function(course){
        if(!self.get('isDestroyed')){
          self.set('course', course);
        }
      });
    },
    searchDirectors: function(searchTerm){
      this.set('directorSearchTerm', searchTerm);
    },
    addDirector: function(user){
      var course = this.get('course');
      course.get('directors').then(function(directors){
        user.get('directedCourses').then(function(courses){
          courses.addObject(course);
          directors.addObject(user);
          course.save();
          user.save();
        });
      });
    },
    removeDirector: function(user){
      var self = this;
      user.get('directedCourses').then(function(courses){
        var course = self.get('course');
        courses.removeObject(course);
        course.get('directors').then(function(directors){
          directors.removeObject(user);
          user.save();
          course.save();
        });
      });
    },
    addTopic: function(topic){
      var course = this.get('course');
      course.get('disciplines').then(function(topics){
        topic.get('courses').then(function(courses){
          courses.addObject(course);
          topics.addObject(topic);
          course.save();
          topic.save();
        });
      });
    },
    removeTopic: function(topic){
      var course = this.get('course');
      course.get('disciplines').then(function(topics){
        topic.get('courses').then(function(courses){
          courses.removeObject(course);
          topics.removeObject(topic);
          course.save();
          topic.save();
        });
      });
    },
    addMeshDescriptor: function(descriptor){
      var course = this.get('course');
      course.get('meshDescriptors').then(function(descriptors){
        descriptor.get('courses').then(function(courses){
          courses.addObject(course);
          descriptors.addObject(descriptor);
          course.save();
          descriptor.save();
        });
      });
    },
    removeMeshDescriptor: function(descriptor){
      var course = this.get('course');
      course.get('meshDescriptors').then(function(descriptors){
        descriptor.get('courses').then(function(courses){
          courses.removeObject(course);
          descriptors.removeObject(descriptor);
          course.save();
          descriptor.save();
        });
      });
    },
    addCohort: function(cohort){
      var course = this.get('course');
      course.get('cohorts').then(function(cohorts){
        cohort.get('courses').then(function(courses){
          courses.addObject(course);
          cohorts.addObject(cohort);
          course.save();
          cohort.save();
        });
      });
    }
  }

});
