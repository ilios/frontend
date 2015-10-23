/* global $ */
export function initialize() {
  //version 1 key
  $.Editable.DEFAULTS.key = 'vD1Ua1Mf1e1VSYKa1EPYD==';
  
  //version 2 key (currently not in use)
  //$.FroalaEditor.DEFAULTS.key = 'vD1Ua1Mf1e1VSYKa1EPYD==';
}

export default {
  name: 'froala',
  initialize: initialize
};
