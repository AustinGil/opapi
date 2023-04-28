import server$ from 'solid-start/server';
import { createSignal } from 'solid-js';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { createParser } from 'eventsource-parser';
import { openai, uploads } from '../services/index.js';
import { Form, Input, Button } from '../components';
import { listFormatter } from '../utils.js';

/**
 * @see https://github.com/Nutlope/twitterbio/blob/main/utils/OpenAIStream.ts
 * @param {Awaited<ReturnType<typeof openai.createCompletion>>} response
 */
function createOpenAIStream(response) {
  const decoder = new TextDecoder();
  let counter = 0;

  return new ReadableStream({
    async start(controller) {
      const parser = createParser((event) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].text || '';
            if (counter < 2 && /\n/.test(text)) {
              return;
            }
            controller.enqueue(text);
            counter++;
          } catch (error) {
            controller.error(error);
          }
        }
      });
      for await (const chunk of response.data) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
}

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
  const breed =
    data.breed?.length > 1
      ? `a combination of these: ${data.breed.join(', ')}`
      : data.breed[0];

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
  const stream = createOpenAIStream(response);

  return new Response(stream);
});

export default function () {
  let [state, setState] = createSignal('');
  /**
   * @param {SubmitEvent} event
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setState('');
    const form = /** @type {HTMLFormElement} */ (event.target);
    const url = new URL(form.action);
    const response = await fetch(url, {
      method: 'POST', // form.method,
      body: new FormData(form),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setState((previous) => previous + chunkValue);
    }
  }

  const characterOptions = ['Harry Potter', 'Darth Vader'];

  return (
    <main>
      <h1 class="text-3xl">Talk to your dog AI</h1>
      {/* <h1 class="text-3xl">Choose a charater to tell you about your code</h1> */}
      <Form action={routeAction.url} method="post" onSubmit={handleSubmit}>
        {(form) => (
          <>
            <Input label="Name" name="name" required value="Nugget" />
            <Input
              label="Breed"
              name="breed"
              type="checkbox"
              options={[
                'chihuahua',
                'dachshund',
                'bulldog',
                'poodle',
                'lab',
                'pincer',
                'great dane',
                'chow',
                'shar-pei',
                'boxer',
              ]}
              required
              class="mb-4"
            />
            <Input label="Age" name="age" type="number" required value="6" />
            <Input
              label="Motivations"
              name="motivations"
              type="checkbox"
              options={[
                'food',
                'walks',
                'toys',
                'cuddles',
                'praise',
                'squirrels',
              ]}
              required
            />

            {/* <Input
          label="Choose a character"
          name="character"
          type="radio"
          required
          options={characterOptions}
        /> */}
            <Input
              label="Give me a prompt"
              name="prompt"
              type="textarea"
              required
              value="Who's a good boy?"
              class="mb-4"
            />
            {/* <Input label="Give me a prompt" name="prompt" type="file">
          {JSON.stringify(Input.state)}
        </Input> */}
            <Button type="submit" aria-disabled={!form.valid}>
              Submit
            </Button>
          </>
        )}
      </Form>

      {state()}
    </main>
  );
}
