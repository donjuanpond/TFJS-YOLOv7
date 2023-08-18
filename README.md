[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![](https://ga4gh.datainsights.cloud/api?repo=tfjs-cv-objectdetection)](https://github.com/SaschaDittmann/gaforgithub)

# TensorFlow.js Example: Using YOLOv7 base model, trained on general data.

This tutorial uses a lot of code from https://github.com/SaschaDittmann/tfjs-cv-objectdetection and is basically a fork of that (making a new repo so that uploading files is easier). That code is all used for the basic website layout, and all the code for decoding the actual YOLOv7 model output into an image with masks is from here: https://github.com/hugozanini/yolov7-tfjs/. I also used this repo's model files as they were already converted conveniently into the correct format.

## Setup 

Prepare the node environments:
```sh
$ yarn
```

Run the local web server script:
```sh
$ node server.js
```

Then, to get a URL to the port this has ran the server on, install localtunnel and use it:
```sh
$ npm install -g localtunnel
$ lt --port 3000
```
