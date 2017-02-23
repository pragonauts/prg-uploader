/*
 * @author David Menger
 */
'use strict';

const Busboy = require('busboy');
const LimitedStream = require('./LimitedStream');
const terminateStream = require('./terminateStream');
const createTree = require('./createTree');

/**
 * The NodeJs multipart/form-data processor
 *
 * @class Uploader
 */
class Uploader {

    /**
     * Creates an instance of Uploader.
     *
     * @param {any} [validator=null] - instance of prg-validator
     *
     * @memberOf Uploader
     */
    constructor (validator = null) {
        this.validator = validator;

        this.files = {};

        this.data = {};

        this._waitForFiles = [];

        this.options = {};
    }

    /**
     * Add a file upload
     *
     * @param {string} field - field name
     * @param {function} [processor=terminateStream] - the request processor
     * @param {number} [maxLength=null] - size limit
     * @param {string[]} [allowedMimes=null] - accept only theese mime types (strings or RegExps)
     * @returns {this}
     * @example
     *
     * // process upload on own using callback
     *
     * uploader.addFile('fieldName', (stream, filename, encoding, mimetype) => {
     *     if (mimetype !== 'image/png') {
     *         stream.resume(); // call when stream is not used
     *         return Promise.resolve(null);
     *     }
     *     // process the stream and return Promise
     *     return Promise.resolve('the result of processing stream');
     * })
     *
     * @memberOf Uploader
     */
    addFile (field, processor = terminateStream, maxLength = null, allowedMimes = null) {
        if (typeof this.files[field] !== 'undefined') {
            throw new Error('File has been already added');
        }

        const file = {
            field,
            processor,
            maxLength,
            allowedMimes
        };

        if (this.validator) {

            let fieldName = field;

            if (!this.validator.rules.has(fieldName)) {
                fieldName = fieldName.replace(/\[[0-9]+\]/g, '[]');
            }

            const rules = this.validator.rules.get(fieldName) || [];

            rules.filter(rule => rule.type === 'validator' && typeof rule.action === 'string')
                .forEach((rule) => {
                    if (rule.action === ':fileMaxLength' && file.maxLength === null) {
                        if (typeof rule.args[0] !== 'number') {
                            throw new Error('Expected number in `:fileMaxLength` validator');
                        }
                        file.maxLength = rule.args[0];
                    } else if (rule.action === ':fileMime' && file.allowedMimes === null) {
                        if (!Array.isArray(rule.args[0])) {
                            throw new Error('Expected array in `:isFileMime` validator');
                        }
                        file.allowedMimes = rule.args[0];
                    }
                });
        }

        this.files[field] = file;

        return this;
    }

    _onFile (field, fileStream, filename, encoding, mimetype) {

        let fieldName = field;

        if (typeof this.files[fieldName] === 'undefined') {
            fieldName = fieldName.replace(/\[[0-9]+\]/g, '[]');
        }

        if (typeof this.files[fieldName] === 'undefined') {
            fileStream.resume();
            return Promise.resolve();
        }

        const file = this.files[fieldName];

        if (file.allowedMimes !== null) {
            if (!file.allowedMimes.some(type => mimetype.match(type))) {
                const allowedTypes = file.allowedMimes.map(type => `${type}`)
                    .join(',');
                const err = new Error(`Mime type does not match: (${allowedTypes})`);
                err.status = 415;
                err.code = 415;
                return Promise.reject(err);
            }
        }

        const stream = new LimitedStream({ maxLength: file.maxLength });
        fileStream.pipe(stream);

        const wait = file.processor(stream, filename, encoding, mimetype)
            .then((data) => {
                createTree({
                    data,
                    name: filename,
                    size: stream.bytes,
                    type: mimetype
                }, field, this.data);
            });

        this._waitForFiles.push(wait);
        return wait;
    }

    /**
     * Process the uploads
     *
     * @param {any} req - the request
     * @param {string} [validatorContext=null] - the context to validator
     * @returns {Promise.<object>}
     *
     * @memberOf Uploader
     */
    process (req, validatorContext = null) {
        return new Promise((resolve, reject) => {
            let bb;
            try {
                bb = new Busboy(Object.assign(this.options, { headers: req.headers }));
            } catch (e) {
                // bad content type
                resolve(req.body);
                return;
            }

            let onFinish;

            const onFile = (...args) => {
                this._onFile(...args)
                    .catch(e => onFinish(e));
            };

            const onField = (fieldname, val) => {
                createTree(val, fieldname, this.data);
            };

            onFinish = (err) => {
                bb.removeListener('file', onFile);
                bb.removeListener('field', onField);
                bb.removeListener('finish', onFinish);
                bb.removeListener('error', onFinish);

                if (err) {
                    reject(err);
                } else {
                    resolve(Promise.all(this._waitForFiles)
                        .then(() => {
                            if (!this.validator) {
                                return this.data;
                            }
                            return this.validator.validate(this.data, validatorContext, true);
                        }));
                }
            };

            bb.on('file', onFile);
            bb.on('field', onField);
            bb.on('error', onFinish);
            bb.on('finish', onFinish);

            req.pipe(bb);
        });
    }

}

module.exports = Uploader;
