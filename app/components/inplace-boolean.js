import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

export default Ember.Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-boolean'],
  saveOnChange: true,
  actions: {
    toggleValue: function(){
      if(this.get('buffer') == null){
        this.set('buffer', this.get('value'));
      }
      this.send('changeValue', !this.get('buffer'));
    }
  }
});
