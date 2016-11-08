import Ember from 'ember';
import DS from 'ember-data';
import { task } from 'ember-concurrency';

const { Component, computed, RSVP, isPresent, ObjectProxy } = Ember;
const { PromiseArray } = DS;

const SequenceBlockProxy = ObjectProxy.extend({
  content: null,
  showRemoveConfirmation: false
});

export default Component.extend({
  classNames: ['detail-view', 'curriculum-inventory-sequence-block-list'],
  parent: null,
  report: null,
  sequenceBlocks: [],
  editorOn: false,
  saved: false,
  savedBlock: null,
  isSaving: null,

  didReceiveAttrs(){
    this._super(...arguments);
    const parent = this.get('parent');
    const report = this.get('report');
    this.get('loadAttr').perform(parent, report);
  },

  loadAttr: task(function * (parent, report) {
    if (isPresent(parent)) {
      let sequenceBlocks = yield parent.get('children');
      let report = yield parent.get('report');
      this.setProperties({
        sequenceBlocks,
        report,
        savedBlock: null,
        saved: false,
      });
    } else {
      let sequenceBlocks = yield report.get('topLevelSequenceBlocks');
      this.setProperties({
        sequenceBlocks,
        savedBlock: null,
        saved: false,
      });
    }
  }),

  isInOrderedSequence: computed('parent', function () {
    const parent = this.get('parent');
    return isPresent(parent) && parent.get('isOrdered');
  }),

  sortedBlocks: computed('sequenceBlocks.@each.orderInSequence', 'parent.childSequenceOrder', function() {
    let defer = RSVP.defer();
    const parent = this.get('parent');
    const sequenceBlocks = this.get('sequenceBlocks');

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
    toggleEditor() {
      if (this.get('editorOn')) {
        this.set('editorOn', false);
      } else {
        this.setProperties({ editorOn: true, saved: false });
      }
    },
    cancel() {
      this.set('editorOn', false);
    },
    save(block) {
      this.set('isSaving', true);
      const report = this.get('report');
      const parent = this.get('parent');
      block.set('report', report);
      return block.save().then((savedBlock) => {
        if (! this.get('isDestroyed')) {
          this.setProperties({saved: true, savedBlock, isSaving: false, editorOn: false});
        }
        report.reload().then(() => {
          if (isPresent(parent)) {
            parent.get('children').then(children => {
              children.invoke('reload');
            });
          }
        });
      });
    },
  }
});
