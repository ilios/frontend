import { loadTranslations } from '@ember-intl/vite';
import { classicEmberSupport, ember,extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { defineConfig } from 'vite';

import errorHandler from './lib/error-handler.mjs';
import loadingAnimation from './lib/loading-animation.mjs';
import newVersion from './lib/new-version.mjs';
import noscript from './lib/noscript.mjs';
import preloadFonts from './lib/preload-fonts.mjs';

export default defineConfig({
  css: {
    devSourcemap: true,
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    preloadFonts(),
    noscript(),
    loadingAnimation(),
    errorHandler(),
    newVersion(),
    loadTranslations(),
  ],
});
