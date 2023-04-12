import { basename, dirname, extname, resolve as resolvePath } from 'node:path';
import { createReadStream, createWriteStream, statSync } from 'node:fs';
// import { rm, mkdir, stat as statAsync, unlink } from 'node:fs/promises';
import { streamMultipart } from '@web3-storage/multipart-parser';

/** @typedef {import('@web3-storage/multipart-parser').FilePart} FilePart */

/** @implements {File} */
export class NodeFileOnDisk {
  // filepath = 'uo';
  // type = 'her';
  // slicer;
  // lastModified = 0;
  // webkitRelativePath = '';

  /**
   * @param {string} filepath
   * @param {string} type
   * @param {any} [slicer]
   */
  constructor(filepath, type, slicer) {
    this.filepath = filepath;
    this.type = type;
    this.slicer = slicer;
    this.name = basename(filepath);
  }
  // get size() {
  //   let stats = statSync(this.filepath);
  //   // if (this.slicer) {
  //   //   let slice = this.slicer.end - this.slicer.start;
  //   //   return slice < 0 ? 0 : slice > stats.size ? stats.size : slice;
  //   // }
  //   return stats.size;
  // }
  // /**
  //  * @param {number} start
  //  * @param {number} end
  //  * @param {string} type
  //  * @returns {Blob}
  //  */
  // slice(start, end, type) {
  //   if (typeof start === 'number' && start < 0) start = this.size + start;
  //   if (typeof end === 'number' && end < 0) end = this.size + end;
  //   let startOffset = this.slicer?.start || 0;
  //   start = startOffset + (start || 0);
  //   end = startOffset + (end || this.size);
  //   return new NodeFileOnDisk(
  //     this.filepath,
  //     typeof type === 'string' ? type : this.type,
  //     {
  //       start,
  //       end,
  //     }
  //   );
  // }
  async arrayBuffer() {
    // let stream = createReadStream(this.filepath);
    // // if (this.slicer) {
    // //   stream = stream.pipe(
    // //     streamSlice.slice(this.slicer.start, this.slicer.end)
    // //   );
    // // }
    // return new Promise((resolve, reject) => {
    //   /** @type {Uint8Array[]} */
    //   let buf = [];
    //   stream.on('data', (chunk) => buf.push(chunk));
    //   stream.on('end', () => resolve(Buffer.concat(buf)));
    //   stream.on('error', (error) => reject(error));
    // });
  }
  // /** @returns {ReadableStream<any> | NodeJS.ReadableStream} */
  // stream() {
  //   let stream = createReadStream(this.filepath);
  //   // if (this.slicer) {
  //   //   stream = stream.pipe(
  //   //     streamSlice.slice(this.slicer.start, this.slicer.end)
  //   //   );
  //   // }
  //   // return createReadableStreamFromReadable(stream);
  //   return stream;
  // }
  // async text() {
  //   return '';
  //   // return readableStreamToString(this.stream());
  // }
  /** @public */
  get [Symbol.toStringTag]() {
    return 'File';
  }
  // /** @returns {Promise<void>} */
  // remove() {
  //   return unlink(this.filepath);
  // }
  /** @returns {string} */
  // getFilePath() {
  //   return this.filepath;
  // }
}

/**
 * @param {FilePart} part
 */
function nodeUploadStreamHandler(part) {
  return new NodeFileOnDisk('/', part.contentType);
}

/**
 * @typedef {import('solid-start/server').createServerAction$} createServerAction$
 * @param {Parameters<Parameters<createServerAction$>[0]>[1]['request']} request
 */
export async function parseMultipartRequest(request) {
  const contentType = request.headers.get('content-type');
  const [type, boundary] = contentType.split(/\s*;\s*boundary=/);

  if (!request.body || !boundary || type !== 'multipart/form-data') {
    throw new Error('Not multipart/form-data');
  }

  const formData = new FormData();
  /** @type {AsyncIterable<FilePart>} */
  const parts = streamMultipart(request.body, boundary);

  for await (const part of parts) {
    if (part.filename == undefined) {
      /** @type {Uint8Array[]} */
      const chunks = [];
      for await (const chunk of part.data) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        formData.append(part.name, Buffer.concat(chunks).toString());
      }
    } else {
      // File Type
      const fileData = await nodeUploadStreamHandler(part);
      if (fileData != undefined) {
        formData.append(part.name, fileData);
      }
    }
  }

  return formData;
}
