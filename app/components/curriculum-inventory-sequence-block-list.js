import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { isPresent } from '@ember/utils';
import { all } from 'rsvp';

const SequenceBlockProxy = ObjectProxy.extend({
  content: null,
  showRemoveConfirmation: false
});

export default Component.extend({
  'data-test-curriculum-inventory-sequence-block-list': true,
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

  sortedBlocks: computed('sequenceBlocks.@each.orderInSequence', 'parent.childSequenceOrder', async function() {
    const parent = this.parent;
    const sequenceBlocks = this.sequenceBlocks;

    if (isPresent(parent) && parent.isOrdered) {
      return sequenceBlocks
        .sortBy('orderInSequence', 'title', 'id')
        .map((block) => SequenceBlockProxy.create({ content: block }));
    } else {
      if (!sequenceBlocks.length) {
        return sequenceBlocks;
      } else {
        const blockProxies = await all(sequenceBlocks.map(async (block) => {
          const proxy = ObjectProxy.create({ content: block, level: null });
          const academicLevel = await block.academicLevel;
          proxy.set('level', academicLevel.level);
          return proxy;
        }));
        return blockProxies
          .sortBy('level', 'startDate', 'title', 'id')
          .map((sortedProxy) => {
            return SequenceBlockProxy.create({
              content: sortedProxy.content
            });
          });
      }
    }
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
