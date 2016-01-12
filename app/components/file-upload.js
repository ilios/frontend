import Ember from 'ember';
import EmberUploader from 'ember-uploader';

const { FileField, Uploader } = EmberUploader;
const { inject, computed } = Ember;
const { service } = inject;

let IliosUploader = Uploader.extend({
  iliosHeaders: [],
  ajaxSettings: function() {
    let settings = this._super(...arguments);
    settings.headers = this.get('iliosHeaders');
    
    return settings;
  }
  
});

export default FileField.extend({
  session: service(),
  url: '',
  headers: computed('session.isAuthenticated', function(){
    let headers = {};
    this.get('session').authorize('authorizer:token', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });
    
    return headers;
  }),

  filesDidChange(files) {
    const uploadUrl = this.get('url');
    const uploader = IliosUploader.create({
      url: uploadUrl,
      iliosHeaders: this.get('headers')
    });
    
    this.sendAction('startUploading');
    
    uploader.on('didUpload', (e) => {
      this.sendAction('finishedUploading', e);
    });
    
    uploader.on('progress', (e) => {
      this.sendAction('setUploadPercentage', e.percent);
    });

    if (!Ember.isEmpty(files)) {
      uploader.upload(files[0]);
    }
  }
  
});
