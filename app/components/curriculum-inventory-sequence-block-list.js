/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isPresent } from '@ember/utils';
import ObjectProxy from '@ember/object/proxy';

const { Promise } = RSVP;

const SequenceBlockProxy = ObjectProxy.extend({
  content: null,
  showRemoveConfirmation: false
});

export default Component.extend({
  init() {
    this._super(...arguments);
    this.set('sequenceBlocks', []);
  },
  classNames: ['curriculum-inventory-sequence-block-list'],
  parent: null,
  report: null,
  canUpdate: false,
  sequenceBlocks: null,
  editorOn: false,
  saved: false,
  savedBlock: null,
  isSaving: null,

  isInOrderedSequence: computed('parent', function () {
    const parent = this.get('parent');
    return isPresent(parent) && parent.get('isOrdered');
  }),

  sortedBlocks: computed('sequenceBlocks.@each.orderInSequence', 'parent.childSequenceOrder', function() {
    return new Promise(resolve => {
      const parent = this.get('parent');
      const sequenceBlocks = this.get('sequenceBlocks');
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
            RSVP.all(promises).then(()=> {
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

  actions: {
    remove(proxy) {
      this.sendAction('remove', proxy.get('content'));
    },
    cancelRemove(proxy) {
      proxy.set('showRemoveConfirmation', false);
    },
    confirmRemove(proxy) {
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
