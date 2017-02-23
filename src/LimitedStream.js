/*
 * @author David Menger
 */
'use strict';

const { Transform } = require('stream');

/**
 * Stream which throws error, when size of stream exceeds allowed length
 *
 * @class LimitedStream
 * @extends {Transform}
 * @example
 *
 * const stream = new LimitedStream({ maxLength: 1024 }); // 1Kb
 * stream.on('error', (err) => {
 *    if (err.code === 413) {
 *       // size exceeded
 *    }
 * });
 */
class LimitedStream extends Transform {

    /**
     * Creates an instance of LimitedStream.
     *
     * @param {Object} options
     * @param {number} [options.maxLength] - the maximal length in bytes
     *
     * @memberOf LimitedStream
     */
    constructor (options) {
        super(options);

        this.bytes = 0;

        this.maxLength = options.maxLength || Number.MAX_VALUE;

        if (typeof this.maxLength !== 'number') {
            throw new Error('`maxLength` should be a number');
        }
    }

    _transform (data, encoding, callback) {
        this.bytes += data.length;

        if (this.bytes > this.maxLength) {
            const err = new Error('Size exceeded');
            err.status = 413;
            err.code = 413;
            callback(err);
        } else {
            callback(null, data);
        }
    }

}

module.exports = LimitedStream;
