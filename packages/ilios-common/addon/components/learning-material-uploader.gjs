import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import readableFileSize from 'ilios-common/utils/readable-file-size';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import perform from 'ember-concurrency/helpers/perform';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

export default class LearningMaterialUploaderComponent extends Component {
  @service fetch;
  @service iliosConfig;
  @service intl;
  @service fileQueue;
  uploadQueueName = 'materials';
  @tracked fileUploadErrorMessage = false;

  upload = task({ drop: true }, async (file) => {
    this.args.setFilename(null);
    this.args.setFileHash(null);
    this.fileUploadErrorMessage = false;
    const maxUploadSize = await this.iliosConfig.getMaxUploadSize();
    if (file.size > maxUploadSize) {
      const maxSize = readableFileSize(maxUploadSize);
      this.fileUploadErrorMessage = this.intl.t('general.fileSizeError', {
        maxSize,
      });
      const queue = this.fileQueue.find(this.uploadQueueName);
      queue.files.splice(queue.files.indexOf(file), 1);
      return false;
    }
    const response = await file.upload(`${this.fetch.host}/upload`, {
      headers: this.fetch.authHeaders,
    });
    if (response.status === 200) {
      const { filename, fileHash } = await response.json();
      this.args.setFilename(filename);
      this.args.setFileHash(fileHash);
      return filename;
    }

    return false;
  });
  <template>
    <span class="learning-material-uploader" data-test-learning-material-uploader ...attributes>
      {{#let (fileQueue name=this.uploadQueueName onFileAdded=(perform this.upload)) as |queue|}}
        {{#if (and (not this.fileUploadErrorMessage) queue.files.length)}}
          <span class="upload-button font-size-base">
            <LoadingSpinner />{{queue.progress}}%
          </span>
        {{else}}
          <label class="upload-button font-size-base" for={{@for}}>
            {{t "general.chooseFile"}}
            <input type="file" id={{@for}} hidden {{queue.selectFile}} />
          </label>
        {{/if}}
        {{#if this.upload.lastSuccessful.value}}
          <span class="upload-result">
            {{this.upload.lastSuccessful.value}}
            <FaIcon @icon={{faCheck}} class="add" />
          </span>
        {{/if}}
        {{#if this.fileUploadErrorMessage}}
          <span class="upload-result validation-error-message">
            <FaIcon @icon={{faCircleExclamation}} class="warning" />
            {{this.fileUploadErrorMessage}}
          </span>
        {{/if}}
      {{/let}}
    </span>
  </template>
}
