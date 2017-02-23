/*
 * @author David Menger
 */
'use strict';

const Uploader = require('./src/Uploader');
const LimitedStream = require('./src/LimitedStream');
const terminateStream = require('./src/terminateStream');

module.exports = {
    Uploader,
    LimitedStream,
    terminateStream
};
