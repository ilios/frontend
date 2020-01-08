/**
 * Callback function for <code>Array.sort()<code>.
 * Compares two given Objects by their position property (in ascending order), and then by id (descending).
 *
 * @method sortableByPosition
 * @param {Ember.Object} obj1
 * @param {Ember.Object} obj2
 * @return {Number}
 */
export default function sortableByPosition(obj1, obj2) {
  // 1. position, asc
  if (obj1.position > obj2.position) {
    return 1;
  } else if (obj1.position < obj2.position) {
    return -1;
  }

  // 2. id, desc
  if (obj1.id > obj2.id) {
    return -1;
  } else if (obj1.id < obj2.id) {
    return 1;
  }
  return 0;
}
