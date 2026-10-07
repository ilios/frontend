import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import errorHandler from './lib/error-handler.mjs';
import newVersion from './lib/new-version.mjs';
import { loadTranslations } from '@ember-intl/vite';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    errorHandler(),
    newVersion(),
    loadTranslations(),
  ],
});
