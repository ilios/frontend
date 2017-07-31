import Mixin from '@ember/object/mixin';

export default Mixin.create({
  title: '',
  isActive: true,
  targetObject: null,
  sortTerm: '',
  isALiveSearchItem: true
});
