import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  classNames: ['learnergroup-members', 'form-container'],
  tagName: 'section',
  cohort: null,
  topLevelGroup: null,
  members: [],
  showMoveToCohortOption: false,
  showMoveToTopLevelGroupOption: false,
  overrideCurrentGroupDisplay: false,
  learnerGroupOptions: function(){
    var defer = Ember.RSVP.defer();
    this.get('cohort').then(
      cohort => {
        var options = [];
        if(this.get('showMoveToCohortOption')){
          options.pushObject(Ember.Object.create({
            id: -1,
            title: this.get('i18n').t('learnerGroups.removeLearnerToCohort', {cohort: cohort.get('displayTitle')})
          }));
        }
        this.get('topLevelGroup').then(
          topLevelGroup => {
            if(this.get('showMoveToTopLevelGroupOption')){
              options.pushObject(Ember.Object.create({
                id: topLevelGroup.get('id'),
                title: this.get('i18n').t('learnerGroups.switchLearnerToGroup', {group: topLevelGroup.get('allParentsTitle') + ' ' + topLevelGroup.get('title')})
              }));
            }
            topLevelGroup.get('allDescendants').then(
              groups => {
                var objs = groups.map(
                  group => {
                    return Ember.Object.create({
                      id: group.get('id'),
                      title: this.get('i18n').t('learnerGroups.switchLearnerToGroup', {group: group.get('allParentsTitle') + ' ' + group.get('title')}),
                      sortTitle: group.get('sortTitle')
                    });
                  }
                ).sortBy('sortTitle');
                options.pushObjects(objs);
                defer.resolve(options);
              }
            );
          }
        );

      }
    );
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('cohort', 'topLevelGroup', 'topLevelGroup.allTreeGroups.@each', 'showMoveToCohortOption', 'showMoveToTopLevelGroupOption'),
  proxiedMembers: function(){
    var defer = Ember.RSVP.defer();

    let userProxy = Ember.ObjectProxy.extend({
      treeGroups: [],
      overrideCurrentGroupDisplay: false,
      lowestGroupInTree: function(){
        let promise = new Ember.RSVP.Promise(
          resolve => {
            this.get('content.learnerGroups').then(
              userGroups => {
                let treeGroups = userGroups.filter(group => this.get('treeGroups').contains(group));
                let deepestGroup, promises = [];
                treeGroups.forEach(group => {
                  let promise = group.get('children').then(children=>{
                    let matchingChildren = children.filter(childGroup => treeGroups.contains(childGroup));
                    if(matchingChildren.length === 0){
                      deepestGroup = group;
                    }
                  });
                  promises.pushObject(promise);
                });
                Ember.RSVP.all(promises).then(()=>{
                  resolve(deepestGroup);
                });
              }
            );
          }
        );
        return DS.PromiseObject.create({
          promise: promise
        });
      }.property('content.learnerGroups.@each', 'treeGroups.@each'),
      groupDisplayValueString: function(){
        if(this.get('overrideCurrentGroupDisplay')){
          return this.get('overrideCurrentGroupDisplay');
        }
        let group = this.get('lowestGroupInTree');
        return group.get('allParentsTitle') + group.get('title');
      }.property('lowestGroupInTree.title', 'lowestGroupInTree.allParentsTitle', 'overrideCurrentGroupDisplay'),
    });
    let topLevelGroup = this.get('topLevelGroup');
    if(topLevelGroup){
      topLevelGroup.then(topLevelGroup => {
        let treeGroups = [];
        treeGroups.pushObject(topLevelGroup);
        topLevelGroup.get('allDescendants').then(all => {
          treeGroups.pushObjects(all);
          let proxiedUsers = this.get('members').map(user => {
            return userProxy.create({
              content: user,
              treeGroups: treeGroups,
              overrideCurrentGroupDisplay: this.get('overrideCurrentGroupDisplay')
            });
          });
          defer.resolve(proxiedUsers);
        });
      });
    } else {
      defer.resolve([]);
    }

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('members.@each', 'topLevelGroup', 'topLevelGroup.allDescendants.@each'),
  actions: {
    changeLearnerGroup: function(groupIdString, userId){
      let groupId = parseInt(groupIdString);
      let groupsToSave = [];
      this.get('store').find('user', userId).then(
        user => {
          this.get('topLevelGroup').then(topLevelGroup => {
            topLevelGroup.removeUserFromGroupAndAllDescendants(user).then(groups=>{
              groupsToSave.pushObjects(groups);
              if(groupId === -1){
                //we're moving this user out of the group into the cohort
                //so just save
                groupsToSave.uniq().invoke('save');
              } else {
                this.get('store').find('learnerGroup', groupId).then( learnerGroup => {
                  learnerGroup.addUserToGroupAndAllParents(user).then(groups =>{
                    groupsToSave.pushObject(groups);
                    groupsToSave.uniq().invoke('save');
                  });
                });
              }
              
            });
          });
        }
      );
    }
  }
});
