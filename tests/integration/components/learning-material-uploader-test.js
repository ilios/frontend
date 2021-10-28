import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { upload } from 'ember-file-upload/mirage';
import { selectFiles } from 'ember-file-upload/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import Response from 'ember-cli-mirage/response';

module('Integration | Component | learning-material-uploader', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('upload file', async function (assert) {
    assert.expect(4);
    const iliosConfigMock = Service.extend({
      async getMaxUploadSize() {
        return 1000;
      },
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);

    this.server.post(
      '/upload',
      upload(function (db, request) {
        const { name } = request.requestBody.file;
        assert.strictEqual(name, 'blob');
        return new Response(
          200,
          {},
          {
            filename: 'test.file',
            fileHash: '1234',
          }
        );
      })
    );
    let filename = null;
    let fileHash = null;

    this.set('setFilename', (name) => {
      filename = name;
    });
    this.set('setFileHash', (hash) => {
      fileHash = hash;
    });

    await render(hbs`<LearningMaterialUploader
      @for="test"
      @setFilename={{this.setFilename}}
      @setFileHash={{this.setFileHash}}
    />`);
    const file = new Blob(['test'], { type: 'text/plain' });
    await selectFiles('[data-test-learning-material-uploader] input', file);
    assert.strictEqual(filename, 'test.file');
    assert.strictEqual(fileHash, '1234');
    assert.dom('[data-test-learning-material-uploader]').containsText('test.file');
  });

  test('shows error when file is too big', async function (assert) {
    assert.expect(1);
    const iliosConfigMock = Service.extend({
      async getMaxUploadSize() {
        return 1;
      },
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);

    this.set('nothing', () => {});

    await render(hbs`<LearningMaterialUploader
      @for="test"
      @setFilename={{this.nothing}}
      @setFileHash={{this.nothing}}
    />`);
    const file = new Blob(['test'], { type: 'text/plain' });
    await selectFiles('[data-test-learning-material-uploader] input', file);
    assert.dom('[data-test-learning-material-uploader]').includesText('This file is too large.');
  });
});
