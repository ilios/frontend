import Ember from 'ember';
import EmberUploader from 'ember-uploader';
import readableFileSize from 'ilios/utils/readable-file-size';

const { FileField, Uploader } = EmberUploader;
const { inject, computed, isEmpty } = Ember;
const { service } = inject;

let IliosUploader = Uploader.extend({
  iliosHeaders: [],
  ajaxSettings: computed('iliosHeaders.[]', function() {
    return {
      headers: this.get('iliosHeaders')
    };
  }),

});

export default FileField.extend({
  session: service(),
  iliosConfig: service(),
  i18n: service(),
  url: '',
  headers: computed('session.isAuthenticated', function(){
    let headers = {};
    this.get('session').authorize('authorizer:token', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });

    return headers;
  }),

  filesDidChange(files) {
    if (isEmpty(files)) {
      return;
    }
    const file = files[0];
    const iliosConfig = this.get('iliosConfig');
    iliosConfig.get('maxUploadSize').then(maxUploadSize => {
      if (file.size > maxUploadSize) {
        const i18n = this.get('i18n');
        const maxSize = readableFileSize(maxUploadSize);
        this.get('setErrorMessage')(i18n.t('general.fileSizeError', {maxSize}));
      } else {
        this.get('startUploading')();
        const uploadUrl = this.get('url');
        const uploader = IliosUploader.create({
          url: uploadUrl,
          iliosHeaders: this.get('headers')
        });


        uploader.on('didUpload', (e) => {
          this.get('finishedUploading')(e);
        });

        uploader.on('progress', (e) => {
          this.get('setUploadPercentage')(e.percent);
        });
        uploader.upload(file);
      }

    });

  }

});
