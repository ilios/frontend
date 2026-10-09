import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import preloadFonts from './lib/preload-fonts.mjs';
import noscript from './lib/noscript.mjs';
import loadingAnimation from './lib/loading-animation.mjs';
import errorHandler from './lib/error-handler.mjs';
import newVersion from './lib/new-version.mjs';
import { loadTranslations } from '@ember-intl/vite';

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
