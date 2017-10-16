/* eslint-env node */
'use strict';

module.exports = {
  name: 'ilios-loading',
  contentFor: function (type, config) {
    if (type === 'head') {
      //inline this CSS so it is parsed the fastest
      return `
        <style type="text/css">
          #ilios-loading-indicator {
            background: #eee;
            height: 100vh;
            left: 0;
            position: fixed;
            top: 0;
            width: 100vw;
          }

          #ilios-loading-indicator h1 {
            left: 50%;
            margin: 0;
            padding: 0;
            position: fixed;
            top: 50%;
            transform: translate(-50%, -50%);
          }

          #ilios-loading-indicator svg {
            fill: #c60;
            height: 50vh;
            overflow: visible;
            stroke: #c60;
            width: 50vw;
          }

          #ilios-loading-indicator circle {
            animation: pulse-ilios-loading-indicator-circle 3s linear infinite;
            transform: scale(0.5);
            transform-origin: center center;
          }

          #ilios-loading-indicator .second-circle {
            animation-delay: 1s;
          }

          #ilios-loading-indicator .third-circle {
            animation-delay: 2s;
          }

          @keyframes pulse-ilios-loading-indicator-circle{
            0%{
              transform: scale(0.5);
              opacity: 0;
            }
            50%{
              opacity: 0.1;
            }
            70%{
              opacity: 0.09;
            }
            100%{
              transform: scale(5);
              opacity: 0;
            }
          }
        </style>
      `;
    }
    if (type === 'test-body-footer') {
      return `<script src="${config.rootURL}ilios-loading/remove-loader-tests.js"></script>`;
    }

    if (type === 'body') {
      return `<div id='ilios-loading-indicator' class='ember-load-indicator'>
        <h1>
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 392.11 392.11">
            <title>Ilios Is Loading</title>
            <path d="M371.83,461.83c-77.62-89.13-98.6-113.11-30.25-93.76-62.12-34.35-30.23-36.41,87.67-44.87-117.91-8.47-149.8-10.52-87.67-44.87-68.34,19.35-47.37-4.63,30.26-93.76-89.12,77.62-113.11,98.6-93.76,30.25-34.35,62.12-36.41,30.23-44.87-87.68-8.47,117.91-10.53,149.8-44.87,87.68,19.35,68.34-4.64,47.37-93.76-30.26,77.62,89.13,98.59,113.11,30.25,93.76,62.12,34.35,30.23,36.41-87.68,44.87,117.91,8.47,149.8,10.52,87.68,44.87,68.34-19.35,47.37,4.63-30.25,93.76,89.12-77.62,113.11-98.6,93.76-30.25,34.35-62.12,36.41-30.23,44.87,87.68,8.47-117.91,10.52-149.8,44.87-87.68C258.71,363.23,282.7,384.21,371.83,461.83Z" transform="translate(-37.14 -127.14)"/>
            <circle cx="50%" cy="50%" r="25%"/>
            <circle class='second-circle' cx="50%" cy="50%" r="25%"/>
            <circle class='third-circle' cx="50%" cy="50%" r="25%"/>
          </svg>
        </h1>
      </div>`;
    }
  }
};
