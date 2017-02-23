/*
 * @author David Menger
 */
'use strict';

/**
 * Converts a stream to buffer
 *
 * @param {ReadableStream} readableStream
 * @returns {Promise.<Buffer>}
 */
function terminateStream (readableStream) {

    let finished = false;
    let buf = new Buffer(0);
    let finish;

    const onData = (data) => {
        buf = Buffer.concat([buf, data]);
    };

    const onEnd = () => finish();

    const onError = err => finish(err);

    readableStream.on('end', onEnd);
    readableStream.on('data', onData);
    readableStream.on('error', onError);

    return new Promise((resolve, reject) => {
        finish = (err) => {
            if (finished) {
                return;
            }
            finished = true;

            readableStream.removeListener('end', onEnd);
            readableStream.removeListener('data', onData);
            readableStream.removeListener('error', onError);

            if (err) {
                reject(err);
            } else {
                resolve(buf);
            }
        };
    });
}

module.exports = terminateStream;
