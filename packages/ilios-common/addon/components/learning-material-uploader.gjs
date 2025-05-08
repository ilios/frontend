<span class="learning-material-uploader" data-test-learning-material-uploader>
  {{#let (file-queue name=this.uploadQueueName onFileAdded=(perform this.upload)) as |queue|}}
    {{#if (and (not this.fileUploadErrorMessage) queue.files.length)}}
      <span class="upload-button">
        <LoadingSpinner />{{queue.progress}}%
      </span>
    {{else}}
      <label class="upload-button" for={{@for}}>
        {{t "general.chooseFile"}}
        <input type="file" id={{@for}} hidden {{queue.selectFile}} />
      </label>
    {{/if}}
    {{#if this.upload.lastSuccessful.value}}
      <span class="upload-result">
        {{this.upload.lastSuccessful.value}}
        <FaIcon @icon="check" class="add" />
      </span>
    {{/if}}
    {{#if this.fileUploadErrorMessage}}
      <span class="upload-result validation-error-message">
        <FaIcon @icon="circle-exclamation" class="warning" />
        {{this.fileUploadErrorMessage}}
      </span>
    {{/if}}
  {{/let}}
</span>