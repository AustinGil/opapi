import server$ from 'solid-start/server';
import { createSignal, createEffect } from 'solid-js';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { openai } from '../../services/index.js';
import { randomString } from '../../utils.js';
import { Form, Input, Button } from '../../components/index.js';

const routeAction = server$(async function (formData) {
  const data = zfd
    .formData({
      name: zfd.text(),
      age: zfd.numeric(),
      motivations: zfd.repeatable(z.array(zfd.text()).min(1)), // zfd.checkbox(),
      breed: zfd.repeatable(z.array(zfd.text()).min(1)), // zfd.checkbox(),
      prompt: zfd.text(),
    })
    .parse(formData);

  // const prompt = z.string().parse(formData.get('prompt'));

  const payload = `I want you to act as a dog. Your name is ${data.name
    }. You are ${data.age
    } years old. Your breed is ${breed}. You are very motivated by ${listFormatter(
      data.motivations
    )}. Do not write any explanations. Only answer like ${data.name
    }. Here's my question for you: ${data.prompt}`;
  // const character = z.string().parse(formData.get('character'));
  // const prompt = z.string().parse(formData.get('prompt'));

  // const payload = `I want you to act like ${character}. I want you to respond and answer like ${character} using the tone, manner and vocabulary ${character} would use. Do not write any explanations. Only answer like ${character}. You must know all of the knowledge of ${character}. My first sentence is "Hi ${character}. Can you please explain the following code: ${prompt}"`;

  const response = await openai.createCompletion(
    {
      model: 'text-davinci-003',
      prompt: payload,
      temperature: 0,
      max_tokens: 1000,
      stream: true,
    },
    { responseType: 'stream' }
  );
  const stream = openai.createStreamFromResponse(response);

  return new Response(stream);
});
export default function () {
  return (
    <main>
      <h1 class="text-3xl">Transcribe a file</h1>
      <Form class="grid gap-4">
        <Input
          label="File"
          name="file"
          type="textarea"
          required
          minlength="2"
        />

        <div>
          <Button type="submit">Request Signed URL</Button>
        </div>
      </Form>
    </main>
  );
}
