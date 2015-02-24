import Ember from 'ember';
import EditInPlaceMixin from 'ilios/mixins/edit-in-place';

export default Ember.Component.extend(EditInPlaceMixin, {
  isPropertyChecked: Ember.computed.oneWay('content'),
  watchChange: function(){
    var checked = this.get('isPropertyChecked');
    var content = this.get('content');
    if(checked !== content){
      this.set('buffer', this.get('isPropertyChecked'));
      this.send('save');
    }
  }.observes('isPropertyChecked'),
});
