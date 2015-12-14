import Ember from 'ember';
import EmberUploader from 'ember-uploader';

const { FileField, Uploader } = EmberUploader;

export default FileField.extend({
  url: '',

  filesDidChange(files) {
    const uploadUrl = this.get('url');
    const uploader = Uploader.create({ url: uploadUrl });
    
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
