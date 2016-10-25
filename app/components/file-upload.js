import Ember from 'ember';
import EmberUploader from 'ember-uploader';
import readableFileSize from 'ilios/utils/readable-file-size';

const { FileField, Uploader } = EmberUploader;
const { RSVP, inject, computed, isEmpty } = Ember;
const { service } = inject;
const { Promise } = RSVP;

const MAXIMUM_UPLOAD_ATTEMPTS = 3;

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
        this.upload(uploader, file, 0);
      }

    });

  },

  upload(uploader, file, attempt){
    return new Promise((resolve, reject) => {
      uploader.upload(file).then(() => {
        resolve();
      }, error => {
        this.get('setUploadPercentage')(0);
        if (attempt < MAXIMUM_UPLOAD_ATTEMPTS) {
          resolve(this.upload(uploader, file, attempt+1));
        } else {
          reject(error);
        }
      });
    });

  }

});
