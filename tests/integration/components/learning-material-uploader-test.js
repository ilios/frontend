import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { uploadHandler } from 'ember-file-upload';
import { selectFiles } from 'ember-file-upload/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

module('Integration | Component | learning-material-uploader', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
      uploadHandler(function (db, request) {
        const { name } = request.requestBody.file;
        assert.strictEqual(name, 'test.file');
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
    />
`);
    const file = new File(['1234'], 'test.file');
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

    await render(hbs`<LearningMaterialUploader
      @for="test"
      @setFilename={{(noop)}}
      @setFileHash={{(noop)}}
    />
`);
    const file = new File(['1234'], 'test.file');
    await selectFiles('[data-test-learning-material-uploader] input', file);
    assert.dom('[data-test-learning-material-uploader]').includesText('This file is too large.');
  });
});
