import RSVP from 'rsvp';

const { map } = RSVP;


/**
 * Clones a group and all children returning all the groups in the order they were created
 * so the first group is the top most group in the tree. If they are saved in order then each parent
 * will be correctly saved before its children
 * @method cloneLearnerGroup
 * @param {Object} store
 * @param {Object} group
 * @param {Object} cohort
 * @param {Boolean} withLearners
 * @param {Object|null} parent
 * @return {Promise.<Array>}
 */
export default async function cloneLearnerGroup(store, group, cohort, withLearners, parent = null) {
  let newGroup = store.createRecord('learner-group', group.getProperties(
    'title',
    'location'
  ));
  newGroup.set('cohort', cohort);
  if (parent) {
    newGroup.set('parent', parent);
  }
  if (withLearners) {
    const users = await group.get('users');
    await map(users.toArray(), async user => {
      await newGroup.addUserToGroupAndAllParents(user);
    });
  }
  const instructors = await group.get('instructors');
  newGroup.set('instructors', instructors);
  const children = await group.get('children');
  let newChildren = await map(children.toArray(), async child => {
    return await cloneLearnerGroup(store, child, cohort, withLearners, newGroup);
  });
  let flat = newChildren.reduce((flattened, obj) => {
    return flattened.pushObjects(obj.toArray());
  }, []);

  return [].concat([newGroup], flat);
}
