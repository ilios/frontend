import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

export default Ember.Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-select'],
  dateFormat: 'MM/DD/YY',
  //a little hacky cuz pikaday doesn't send actions
  dateBuffer: Ember.computed.oneWay('buffer'),
  dateBufferChanged: Ember.observer('dateBuffer', function(){
    if(this.get('dateBuffer') !== this.get('buffer')){      
      this.send('changeValue', this.get('dateBuffer'));
    }
  })
});
