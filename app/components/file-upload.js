/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import EmberUploader from 'ember-uploader';
import readableFileSize from 'ilios/utils/readable-file-size';
import { task, timeout } from 'ember-concurrency';

const { FileField, Uploader } = EmberUploader;

const MAXIMUM_UPLOAD_ATTEMPTS = 3;

let IliosUploader = Uploader.extend({
  iliosHeaders: null,
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

        return this.get('upload').perform(uploader, file, 0);
      }

    });

  },

  upload: task(function * (uploader, file, attempt) {
    try {
      let data = yield uploader.upload(file);
      return data;
    } catch (error) {
      this.get('setUploadPercentage')(0);
      yield timeout(attempt * 1000);
      if (attempt < MAXIMUM_UPLOAD_ATTEMPTS) {
        this.get('upload').perform(uploader, file, attempt+1);
      } else {
        const i18n = this.get('i18n');
        throw new Error(i18n.t('general.fileUploadError'));
      }
    }
  }).restartable(),

});
