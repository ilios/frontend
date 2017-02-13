import Ember from 'ember';

const { Mixin } = Ember;

export default Mixin.create({

  /**
   * Callback function for <code>Array.sort()<code>.
   *
   * @method learningMaterialSortingCallback
   * @param {Ember.Object} obj1
   * @param {Ember.Object} obj2
   * @return {Number}
   */
  learningMaterialSortingCallback(obj1, obj2) {
    let pos1 = obj1.get('position');
    let pos2 = obj2.get('position');
    // 1. position, asc
    if (pos1 > pos2) {
      return 1;
    } else if (pos1 < pos2) {
      return -1;
    }

    // 2. id, desc
    let id1 = obj1.get('id');
    let id2 = obj2.get('id');
    if (id1 > id2) {
      return -1;
    } else if (id1 < id2) {
      return 1;
    }
    return 0;
  },
});
