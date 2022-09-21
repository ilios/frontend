import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';
import readableFileSize from 'ilios-common/utils/readable-file-size';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class LearningMaterialUploaderComponent extends Component {
  @service fetch;
  @service iliosConfig;
  @service intl;
  @service fileQueue;
  uploadQueueName = 'materials';
  @tracked fileUploadErrorMessage = false;

  upload = dropTask(async (file) => {
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
}
