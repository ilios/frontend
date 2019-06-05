import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { isPresent } from '@ember/utils';
import { Promise, all } from 'rsvp';

const SequenceBlockProxy = ObjectProxy.extend({
  content: null,
  showRemoveConfirmation: false
});

export default Component.extend({
  classNames: ['curriculum-inventory-sequence-block-list'],

  canUpdate: false,
  editorOn: false,
  isSaving: null,
  parent: null,
  report: null,
  saved: false,
  savedBlock: null,
  sequenceBlocks: null,

  isInOrderedSequence: computed('parent', function() {
    const parent = this.parent;
    return isPresent(parent) && parent.get('isOrdered');
  }),

  sortedBlocks: computed('sequenceBlocks.@each.orderInSequence', 'parent.childSequenceOrder', function() {
    return new Promise(resolve => {
      const parent = this.parent;
      const sequenceBlocks = this.sequenceBlocks;
      if (isPresent(parent) && parent.get('isOrdered')) {
        let sortedBlocks = [];
        sequenceBlocks.sortBy('orderInSequence', 'title', 'id').forEach(block => {
          sortedBlocks.pushObject(SequenceBlockProxy.create({
            content: block
          }));
        });
        resolve(sortedBlocks);
      } else {
        let promises = [];
        let blockProxies = [];
        if (! sequenceBlocks.length) {
          resolve(sequenceBlocks);
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
            all(promises).then(()=> {
              let sortedProxies = blockProxies.sortBy('level', 'startDate', 'title', 'id');
              let sortedBlocks = [];
              sortedProxies.forEach(sortedProxy => {
                sortedBlocks.pushObject(SequenceBlockProxy.create({
                  content: sortedProxy.get('content')
                }));
              });
              resolve(sortedBlocks);
            });
          });
        }
      }
    });
  }),

  init() {
    this._super(...arguments);
    this.set('sequenceBlocks', []);
  },

  actions: {
    remove(proxy) {
      this.remove(proxy.get('content'));
    },

    cancelRemove(proxy) {
      proxy.set('showRemoveConfirmation', false);
    },

    confirmRemove(proxy) {
      proxy.set('showRemoveConfirmation', true);
    },

    toggleEditor() {
      if (this.editorOn) {
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
      const report = this.report;
      const parent = this.parent;
      return block.save().then((savedBlock) => {
        if (! this.isDestroyed) {
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
    }
  }
});
