import server$ from 'solid-start/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createSignal, createEffect } from 'solid-js';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { randomString } from '../../utils.js';
// eslint-disable-next-line unicorn/prevent-abbreviations
import { db, uploads } from '../../services/index.js';
import { Form, Input, Button } from '../../components/index.js';

const { S3_URL, S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION } = process.env;
const s3Client = new S3Client({
  endpoint: `https://${S3_URL}`,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  region: S3_REGION,
});

async function getSignedUrl$(formData) {
  // TODO: Validate formData
  const fileName = randomString();
  /** @type {File} */
  const file = formData.get('file');
  const command = new PutObjectCommand({
    Bucket: 'austins-bucket',
    Key: `opapi/${fileName}`,
    ACL: 'public-read',
    ContentType: file.type,
  });
  const [signedUrl] = await Promise.all([
    getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }),
    db.file.create({
      data: {
        location: `opapi/${fileName}`,
      },
    }),
  ]);

  return { signedUrl };
}

async function getDatabaseFiles$() {
  const files = await db.file.findMany();
  return files;
}

export default function () {
  /** @param {SubmitEvent} event */
  async function onUpload(event) {
    event.preventDefault();
    const form = /** @type {HTMLFormElement} */ (event.target);
    const formData = new FormData(form);

    // Request a signed URL to upload files to
    const getSignedUrl = server$(getSignedUrl$);
    const { signedUrl } = await getSignedUrl(formData);

    // Upload the file
    await fetch(signedUrl, {
      method: 'PUT',
      body: formData,
    });

    // Ping DB to fetch file meta

    const getDatabaseFiles = server$(getDatabaseFiles$);
    const files = await getDatabaseFiles();
  }

  return (
    <main>
      <h1 class="text-3xl">Transcribe a file</h1>
      <Form method="post" onSubmit={onUpload}>
        {() => (
          <>
            <Input label="File" name="file" type="file" required />

            <Button type="submit">Request Signed URL</Button>
          </>
        )}
      </Form>
    </main>
  );
}
