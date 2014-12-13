import Ember from 'ember';
import EditInPlaceMixin from 'ilios/mixins/edit-in-place';

export default Ember.Component.extend(EditInPlaceMixin, {
  text: Ember.computed.oneWay('content'),
  shortText: function(){
    var text = this.get('text');
    if(text === undefined || text == null){
      return '';
    }
    return text.substr(0,200);
  }.property('text')
});
