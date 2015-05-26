import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

export default Ember.Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-textarea'],
  options: '{' +
    '"autoLink": true,' +
    '"forcePlainText": false,' +
    '"cleanPastedHTML": true,' +
    '"imageDragging": false,' +
    '"buttons": ["unorderedlist", "orderedlist","bold", "italic", "underline", "anchor", "header1", "header2", "quote"]' +
  '}',
});
