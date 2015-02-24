import Ember from 'ember';
import EditInPlaceMixin from 'ilios/mixins/edit-in-place';

export default Ember.Component.extend(EditInPlaceMixin, {
  text: function(){
    if(this.get('content')){
      return this.get('content');
    }
    return Ember.I18n.t('general.clickToEdit');
  }.property('content'),
  stripHtml: false,
  length: 200,
  shortText: function(){
    var text = this.get('text');
    if(text === undefined || text == null){
      return '';
    }
    if(this.get('stripHtml')){
      text = text.replace(/(<([^>]+)>)/ig,"");
    }
    if(this.get('length')){
      text = text.substr(0,this.get('length'));
    }
    return text;
  }.property('text')
});
