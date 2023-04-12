import { spawn } from 'node:child_process';

(function () {
  console.log('calling python from node');
  const command = spawn('python3', ['transcribe.py']);

  /** @type {Buffer[]} */
  const chunks = [];
  command.stdout.on('data', (data) => {
    chunks.push(data);
    // console.log(data.toString());
  });
  /** @type {Buffer[]} */
  const errorChunks = [];
  command.stderr.on('data', (data) => {
    errorChunks.push(data);
  });
  command.on('close', () => {
    if (errorChunks.length > 0) {
      throw new Error(Buffer.concat(errorChunks).toString());
    }
    console.log(Buffer.concat(chunks).toString());
  });
})();
