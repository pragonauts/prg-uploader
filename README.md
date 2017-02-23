# Pragonauts Uploader

Busboy based utility, which helps us:

  1. Processes the `multipart/form-data` with busboy
  2. Validates uploads (mime type and size)
  3. Transforms each upload to a Promise (by default to Buffer)
  4. After all resolves promise

## Example

```javascript

const express = require('express');
const { Uploader, terminateStream } = require('prg-uploader');

const app = new express.Router();

app.post('/', (req, res) => {

    const uploader = new Uploader();

    uploader.addFile('image', terminateStream, '1mb', [
        'image/gif',
        'image/jpeg',
        'image/png
    ]);

    uploader.process(req)
        .then((data) => {
            res.send({
                ok: 1,
                receivedMimeType: data.image.type,
                receivedFileSize; data.image.size, // same as buffer length
                receivedDataLength: data.image.data.length,
                isBuffer: Buffer.isBuffer(data.image.data) // true
            });
        })
        .catch((e) => {
            res.status(e.status) // 413=file size exceeded, 415=mime does not match
                .send(e.message);
        });
}));

module.exports = app;

```

## Using with Pragonauts validator

Uploader uses validation rules from Validator and runs validator with given data

```javascript

const express = require('express');
const Validator = require('prg-validator');
const { Uploader, terminateStream } = require('prg-uploader');

const app = new express.Router();


const validator = new Validator();

validator.add('file')
    .isFileMaxLength('shlould be smaller then 1Mb', '1m')
    .isFileMime('Should be an excel file', [
        'application/vnd.ms-excel',
        'application/msexcel',
        'application/x-msexcel',
        'application/x-ms-excel',
        'application/x-excel',
        'application/x-dos_ms_excel',
        'application/xls',
        'application/x-xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ])
    .toFileData(); // extracts buffer from the file

app.post('/', (req, res) => {

    const uploader = new Uploader(validator);

    uploader.addFile('file');

    uploader.process(req)
        .then((data) => {
            res.send({
                ok: 1,
                receivedDataLength: data.file.length,
                isBuffer: Buffer.isBuffer(data.file) // true
            });
        })
        .catch((e) => {
            res.status(e.status) // 413=file size exceeded, 415=mime does not match
                .send(e.message);
        });
}));

module.exports = app;

```

-----------------

# API
## Classes

<dl>
<dt><a href="#Uploader">Uploader</a></dt>
<dd></dd>
<dt><a href="#LimitedStream">LimitedStream</a> ⇐ <code>Transform</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#terminateStream">terminateStream(readableStream)</a> ⇒ <code>Promise.&lt;Buffer&gt;</code></dt>
<dd><p>Converts a stream to buffer</p>
</dd>
</dl>

<a name="Uploader"></a>

## Uploader
**Kind**: global class  

* [Uploader](#Uploader)
    * [new Uploader()](#new_Uploader_new)
    * _instance_
        * [.addFile(field, [processor], [maxLength], [allowedMimes])](#Uploader+addFile) ⇒ <code>this</code>
        * [.process(req, [validatorContext])](#Uploader+process) ⇒ <code>Promise.&lt;object&gt;</code>
    * _static_
        * [.Uploader](#Uploader.Uploader)
            * [new Uploader([validator])](#new_Uploader.Uploader_new)

<a name="new_Uploader_new"></a>

### new Uploader()
The NodeJs multipart/form-data processor

<a name="Uploader+addFile"></a>

### uploader.addFile(field, [processor], [maxLength], [allowedMimes]) ⇒ <code>this</code>
Add a file upload

**Kind**: instance method of <code>[Uploader](#Uploader)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| field | <code>string</code> |  | field name |
| [processor] | <code>function</code> | <code>terminateStream</code> | the request processor |
| [maxLength] | <code>number</code> | <code></code> | size limit |
| [allowedMimes] | <code>Array.&lt;string&gt;</code> | <code></code> | accept only theese mime types (strings or RegExps) |

**Example**  
```javascript
// process upload on own using callback

uploader.addFile('fieldName', (stream, filename, encoding, mimetype) => {
    if (mimetype !== 'image/png') {
        stream.resume(); // call when stream is not used
        return Promise.resolve(null);
    }
    // process the stream and return Promise
    return Promise.resolve('the result of processing stream');
})
```
<a name="Uploader+process"></a>

### uploader.process(req, [validatorContext]) ⇒ <code>Promise.&lt;object&gt;</code>
Process the uploads

**Kind**: instance method of <code>[Uploader](#Uploader)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>any</code> |  | the request |
| [validatorContext] | <code>string</code> | <code>null</code> | the context to validator |

<a name="Uploader.Uploader"></a>

### Uploader.Uploader
**Kind**: static class of <code>[Uploader](#Uploader)</code>  
<a name="new_Uploader.Uploader_new"></a>

#### new Uploader([validator])
Creates an instance of Uploader.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [validator] | <code>any</code> | <code></code> | instance of prg-validator |

<a name="LimitedStream"></a>

## LimitedStream ⇐ <code>Transform</code>
**Kind**: global class  
**Extends:** <code>Transform</code>  

* [LimitedStream](#LimitedStream) ⇐ <code>Transform</code>
    * [new LimitedStream()](#new_LimitedStream_new)
    * [.LimitedStream](#LimitedStream.LimitedStream)
        * [new LimitedStream(options)](#new_LimitedStream.LimitedStream_new)

<a name="new_LimitedStream_new"></a>

### new LimitedStream()
Stream which throws error, when size of stream exceeds allowed length

**Example**  
```javascript
const stream = new LimitedStream({ maxLength: 1024 }); // 1Kb
stream.on('error', (err) => {
   if (err.code === 413) {
      // size exceeded
   }
});
```
<a name="LimitedStream.LimitedStream"></a>

### LimitedStream.LimitedStream
**Kind**: static class of <code>[LimitedStream](#LimitedStream)</code>  
<a name="new_LimitedStream.LimitedStream_new"></a>

#### new LimitedStream(options)
Creates an instance of LimitedStream.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| [options.maxLength] | <code>number</code> | the maximal length in bytes |

<a name="terminateStream"></a>

## terminateStream(readableStream) ⇒ <code>Promise.&lt;Buffer&gt;</code>
Converts a stream to buffer

**Kind**: global function  

| Param | Type |
| --- | --- |
| readableStream | <code>ReadableStream</code> | 

