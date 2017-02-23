/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const Validator = require('prg-validator');
const Uploader = require('../src/Uploader');
const { PassThrough } = require('stream');

const UPLOAD_0 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const UPLOAD_1 = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';

const MULTIPART_TEST = [
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="file_name_0"',
    '',
    'super alpha file',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="file_name_1"',
    '',
    'super beta file',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
    'Content-Type: application/octet-stream',
    '',
    UPLOAD_0,
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="upload_file_1"; filename="1k_b.dat"',
    'Content-Type: application/octet-stream',
    '',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="cont"',
    '',
    '123',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
].join('\r\n');

const MULTIPART_ARRAYS = [
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="upload_file[0].text"',
    '',
    'super alpha file',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="upload_file[1].text"',
    '',
    'super beta file',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="upload_file[0].file"; filename="1k_a.dat"',
    'Content-Type: application/octet-stream',
    '',
    UPLOAD_0,
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="upload_file[1].file"; filename="1k_b.dat"',
    'Content-Type: application/octet-stream',
    '',
    UPLOAD_1,
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    'Content-Disposition: form-data; name="cont[0]"',
    '',
    '123',
    '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
].join('\r\n');

describe('Uploader', function () {

    this.timeout(0);

    it('should transform stream to data', function (done) {
        const u = new Uploader();

        u.addFile('upload_file_0');

        const stream = new PassThrough();

        stream.headers = {
            'content-type': 'multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
        };

        u.process(stream)
            .then((data) => {
                assert.deepEqual(data, {
                    cont: '123',
                    file_name_0: 'super alpha file',
                    file_name_1: 'super beta file',
                    upload_file_0: {
                        data: data.upload_file_0.data,
                        name: '1k_a.dat',
                        size: 1023,
                        type: 'application/octet-stream'
                    }
                });
                done();
            })
            .catch(done);

        setTimeout(() => {
            stream.write(new Buffer(MULTIPART_TEST, 'utf8'));
            stream.end();
        }, 15);
    });

    it('should throw an error, when content exceeds allowed length', function (done) {
        const u = new Uploader();

        u.addFile('upload_file_0', undefined, 1022);

        const stream = new PassThrough();

        stream.headers = {
            'content-type': 'multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
        };

        u.process(stream)
            .then(() => {
                done('should not be called');
            })
            .catch((err) => {
                assert.equal(err.code, 413, 'code should match');
                assert.equal(err.status, 413, 'code should match');
                done();
            });

        setTimeout(() => {
            stream.write(new Buffer(MULTIPART_TEST, 'utf8'));
            stream.end();
        }, 15);
    });

    it('does not allow to insert two same files', function () {
        const u = new Uploader();

        u.addFile('same');

        assert.throws(() => {
            u.addFile('same');
        });
    });

    it('should pass body, when content type is not supported', function () {
        const u = new Uploader();

        const stream = new PassThrough();

        stream.headers = {
            'content-type': 'application/json'
        };

        stream.body = {};

        return u.process(stream)
            .then((data) => {
                assert.strictEqual(data, stream.body);
            });
    });

    it('should work with validator', function (done) {

        const validator = new Validator();

        validator.add('cont')
            .toInt();

        validator.add('upload_file_0')
            .isFileMaxLength('should be fine', '1k')
            .isFileMime('shoudl be stream', 'application/octet-stream')
            .toFileData();

        const u = new Uploader(validator);

        u.addFile('upload_file_0');

        const stream = new PassThrough();

        stream.headers = {
            'content-type': 'multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
        };

        u.process(stream)
            .then((data) => {
                assert.deepEqual(data, {
                    cont: 123,
                    upload_file_0: new Buffer(UPLOAD_0)
                });
                done();
            })
            .catch(done);

        setTimeout(() => {
            stream.write(new Buffer(MULTIPART_TEST, 'utf8'));
            stream.end();
        }, 15);

    });

    it('should validate mime type', function (done) {

        const validator = new Validator();

        validator.add('cont')
            .toInt();

        validator.add('upload_file_0')
            .isFileMaxLength('should be fine', 1022)
            .isFileMime('shoudl be stream', 'image/jpeg')
            .toFileData();

        const u = new Uploader(validator);

        u.addFile('upload_file_0');

        u.addFile('upload_file_1');

        const stream = new PassThrough();

        stream.headers = {
            'content-type': 'multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
        };

        u.process(stream)
            .then(() => {
                done('should never been called');
            })
            .catch((e) => {
                assert.equal(e.code, 415, 'code should be 415');
                assert.equal(e.status, 415, 'status should be 415');
                done();
            });

        setTimeout(() => {
            stream.write(new Buffer(MULTIPART_TEST, 'utf8'));
            stream.end();
        }, 15);

    });

    it('should validate size', function (done) {

        const validator = new Validator();

        validator.add('cont')
            .toInt();

        validator.add('upload_file_0')
            .isFileMaxLength('should be fine', 1022)
            .isFileMime('shoudl be stream', 'application/octet-stream')
            .toFileData();

        const u = new Uploader(validator);

        u.addFile('upload_file_0');

        const stream = new PassThrough();

        stream.headers = {
            'content-type': 'multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
        };

        u.process(stream)
            .then(() => {
                done('should never been called');
            })
            .catch((e) => {
                assert.equal(e.code, 413, 'code should be 413');
                assert.equal(e.status, 413, 'status should be 413');
                done();
            });

        setTimeout(() => {
            stream.write(new Buffer(MULTIPART_TEST, 'utf8'));
            stream.end();
        }, 15);

    });

    it('should work with array fields', function (done) {

        const validator = new Validator();

        validator.add('cont[]')
            .toInt();

        validator.add('upload_file[].text');

        validator.add('upload_file[].file')
            .isFileMaxLength('should be fine', 1023)
            .isFileMime('shoudl be stream', 'application/octet-stream')
            .toFileData();

        const u = new Uploader(validator);

        u.addFile('upload_file[].file');

        const stream = new PassThrough();

        stream.headers = {
            'content-type': 'multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
        };

        u.process(stream)
            .then((data) => {
                assert.deepEqual(data, {
                    cont: [123],
                    upload_file: [
                        { file: new Buffer(UPLOAD_0), text: 'super alpha file' },
                        { file: new Buffer(UPLOAD_1), text: 'super beta file' }
                    ]
                });
                done();
            })
            .catch(done);

        setTimeout(() => {
            stream.write(new Buffer(MULTIPART_ARRAYS, 'utf8'));
            stream.end();
        }, 15);

    });

});
