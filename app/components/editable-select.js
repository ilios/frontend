import Ember from 'ember';
import EditInPlaceMixin from 'ilios/mixins/edit-in-place';

export default Ember.Component.extend(EditInPlaceMixin, {
  options: [],
  selectedValue: null,
  valuePath: null,
  labelPath: null,
  optionValuePath: function(){
    var str = 'content';
    if(this.get('valuePath')){
      str += '.' + this.get('valuePath');
    }

    return str;
  }.property('valuePath'),
  optionLabelPath: function(){
    var str = 'content';
    if(this.get('labelPath')){
      str += '.' + this.get('labelPath');
    }

    return str;
  }.property('labelPath'),
  displayValue: function(){
    var content = this.get('content');
    if(content && this.get('labelPath')){
      return content.get(this.get('labelPath'));
    }

    return content;
  }.property('content', 'labelPath'),
  watchSelectedValue: function(){
    var value = this.get('selectedValue');
    var buffer = this.get('buffer');
    var valuePath = this.get('valuePath');
    var choice = this.get('options').find(function(option){
      if(valuePath){
        return option.get(valuePath) === value;
      }
      return option === value;
    });
    if(buffer !== choice){
      this.set('buffer', choice);
    }
  }.observes('selectedValue'),
  actions: {
    edit: function(){
      var content = this.get('content');
      var valuePath = this.get('valuePath');
      if(content){
        var selected = this.get('options').find(function(option){
          if(valuePath){
            return option.get(valuePath) === content.get(valuePath);
          }
          return option === content;
        });
        if(selected){
          if(valuePath){
            selected = selected.get(valuePath);
          }
          this.set('selectedValue', selected);
        }
      }
      this.set('buffer', content);
      this.set('isEditing', true);
    },
  }
});
