import Ember from 'ember';
import EmberUploader from 'ember-uploader';

const { observer } = Ember;
const { FileField } = EmberUploader;

export default FileField.extend({
  url: '',
  filesDidChange: observer('files', function() {
    var uploadUrl = this.get('url');
    var files = this.get('files');

    var uploader = EmberUploader.Uploader.create({
      url: uploadUrl
    });

    uploader.on('didUpload', e=> {
      this.sendAction('finishedUploading', e);
    });

    if (!Ember.isEmpty(files)) {
      uploader.upload(files[0]);
    }
  })
});
