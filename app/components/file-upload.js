/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import FileField from 'ember-uploader/components/file-field';
import Uploader from 'ember-uploader/uploaders/uploader';

import readableFileSize from 'ilios/utils/readable-file-size';
import { task, timeout } from 'ember-concurrency';

const MAXIMUM_UPLOAD_ATTEMPTS = 3;

let IliosUploader = Uploader.extend({
  iliosHeaders: null,
  ajaxSettings: computed('iliosHeaders.[]', function() {
    return {
      headers: this.iliosHeaders
    };
  }),

});

export default FileField.extend({
  session: service(),
  iliosConfig: service(),
  i18n: service(),
  url: '',
  headers: computed('session.isAuthenticated', function () {
    const session = this.session;
    const { jwt } = session.data.authenticated;
    let headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return headers;
  }),

  filesDidChange(files) {
    if (isEmpty(files)) {
      return;
    }
    const file = files[0];
    const iliosConfig = this.iliosConfig;
    iliosConfig.get('maxUploadSize').then(maxUploadSize => {
      if (file.size > maxUploadSize) {
        const i18n = this.i18n;
        const maxSize = readableFileSize(maxUploadSize);
        this.setErrorMessage(i18n.t('general.fileSizeError', {maxSize}));
      } else {
        this.startUploading();
        const uploadUrl = this.url;
        const uploader = IliosUploader.create({
          url: uploadUrl,
          iliosHeaders: this.headers
        });


        uploader.on('didUpload', (e) => {
          this.finishedUploading(e);
        });

        uploader.on('progress', (e) => {
          this.setUploadPercentage(e.percent);
        });

        return this.upload.perform(uploader, file, 0);
      }

    });

  },

  upload: task(function * (uploader, file, attempt) {
    try {
      let data = yield uploader.upload(file);
      return data;
    } catch (error) {
      this.setUploadPercentage(0);
      yield timeout(attempt * 1000);
      if (attempt < MAXIMUM_UPLOAD_ATTEMPTS) {
        this.upload.perform(uploader, file, attempt+1);
      } else {
        const i18n = this.i18n;
        throw new Error(i18n.t('general.fileUploadError'));
      }
    }
  }).restartable(),

});
