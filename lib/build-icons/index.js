/* eslint-env node */
'use strict';

const path = require('path');
const GenerateIcons = require('./generate-icons');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'build-icons',
  included(app) {
    this.app = app;
  },
  treeForPublic(publicTree) {
    const images = path.join(__dirname, 'images');
    const node = new Funnel(images, {
      include: ['sunburst.svg', 'sunburst-icon.svg']
    });
    const whiteBackgroundIMages = new GenerateIcons(node, {
      sizes: [96, 180, 192],
      inputFilename: 'sunburst.svg',
      outputFileName: 'sunburst-white-background',
      background: {r: 255, g: 255, b: 255, alpha: 0},
      project: this.app.project,
    });
    let trees = [];
    const backgroundFunnel = new Funnel(whiteBackgroundIMages, {
      destDir: 'assets/icons'
    });
    trees.push(backgroundFunnel);

    const transparentImages = new GenerateIcons(node, {
      sizes: [16, 32, 48, 150, 512],
      inputFilename: 'sunburst.svg',
      outputFileName: 'sunburst-transparent',
      project: this.app.project,
    });
    const transparentFunnel = new Funnel(transparentImages, {
      destDir: 'assets/icons'
    });
    trees.push(transparentFunnel);

    if (publicTree) {
      trees.push(publicTree);
    }

    return new MergeTrees(trees);
  },
};
