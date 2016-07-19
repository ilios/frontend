import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, RSVP, isPresent, ObjectProxy } = Ember;
const { alias } = computed;
const { PromiseArray } = DS;

const SequenceBlockProxy = ObjectProxy.extend({
  content: null,
  showRemoveConfirmation: false
});

export default Component.extend({
  classNames: ['detail-view', 'curriculum-inventory-sequence-block-list'],
  parentBlock: null,
  report: null,
  sequenceBlocks: null,

  init() {
    this._super(...arguments);
    this.set('sequenceBlocks', []);
  },

  isEditable: alias('report.isFinalized'),

  sortedBlocks: computed('sequenceBlocks.@each.orderInSequence', 'parent.childSequenceOrder', function() {
    const parent = this.get('parent');
    const sequenceBlocks = this.get('sequenceBlocks');
    let defer = RSVP.defer();
    if (isPresent(parent) && 1 === parent.get('childSequenceOrder')) {
      let sortedBlocks = [];
      sequenceBlocks.sortBy('orderInSequence', 'title', 'id').forEach(block => {
        sortedBlocks.pushObject(SequenceBlockProxy.create({
          content: block
        }));
      });
      defer.resolve(sortedBlocks);
    } else {
      let promises = [];
      let blockProxies = [];
      if (! sequenceBlocks.length) {
        defer.resolve(sequenceBlocks);
      } else {
        sequenceBlocks.forEach(block => {
          let proxy = ObjectProxy.create({
            content: block,
            level: null
          });
          let promise = block.get('academicLevel').then(academicLevel => {
            proxy.set('level', academicLevel.get('level'));
            blockProxies.pushObject(proxy);
          });
          promises.pushObject(promise);
          RSVP.all(promises).then(()=> {
            let sortedProxies = blockProxies.sortBy('level', 'startDate', 'title', 'id');
            let sortedBlocks = [];
            sortedProxies.forEach(sortedProxy => {
              sortedBlocks.pushObject(SequenceBlockProxy.create({
                content: sortedProxy.get('content')
              }));
            });
            defer.resolve(sortedBlocks);
          });
        });
      }
    }
    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  actions: {
    remove: function(proxy){
      this.sendAction('remove', proxy.get('content'));
    },
    cancelRemove: function(proxy){
      proxy.set('showRemoveConfirmation', false);
    },
    confirmRemove: function(proxy){
      proxy.set('showRemoveConfirmation', true);
    },
  }
});
