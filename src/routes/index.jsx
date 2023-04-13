import server$, { createServerAction$, eventStream } from 'solid-start/server';
import { createEffect, createSignal, onCleanup, Show, onMount } from 'solid-js';
import { z } from 'zod';
import { createParser } from 'eventsource-parser';
import { openai, uploads } from '../services/index.js';
import { Input, Button } from '../components';

/**
 * @see https://github.com/Nutlope/twitterbio/blob/main/utils/OpenAIStream.ts
 * @param {Awaited<ReturnType<typeof openai.createCompletion>>} response
 */
function createOpenAIStream(response) {
  const decoder = new TextDecoder();
  let counter = 0;

  return new ReadableStream({
    async start(controller) {
      /** @param {import('eventsource-parser').ParsedEvent | import('eventsource-parser').ReconnectInterval} event */
      function onParse(event) {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            /**
             * Completion Data:
             * data: {"id": "cmpl-74e2oF4Hoqfz5duNHWKXjvM0ANCGp", "object": "text_completion", "created": 1681341598, "choices": [{"text": "\n", "index": 0, "logprobs": null, "finish_reason": null}], "model": "text-davinci-003"}
             *
             * Chat Completion Data:
             * data: {"id":"chatcmpl-74e5W3iHLdixvxeqOUEHrOY0vzrN5","object":"chat.completion.chunk","created":1681341766,"model":"gpt-3.5-turbo-0301","choices":[{"delta":{"role":"assistant"},"index":0,"finish_reason":null}]}
             */
            const json = JSON.parse(data);
            const text = json.choices[0].text || '';
            // const text = json.choices[0].delta?.content || '';
            if (counter < 2 && (text.match(/\n/) || []).length > 0) {
              return;
            }
            controller.enqueue(text);
            counter++;
          } catch (error) {
            controller.error(error);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of response.data) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
}

const routeAction = server$(async function (formData) {
  const prompt = z.string().parse(formData.get('prompt'));

  const response = await openai.createCompletion(
    {
      model: 'text-davinci-003',
      prompt: prompt,
      temperature: 0,
      max_tokens: 10,
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

  return (
    <main>
      {state()}
      <form action={routeAction.url} method="post" onSubmit={handleSubmit}>
        <Input
          label="Give me a prompt"
          name="prompt"
          type="textarea"
          value="Tell me how Harry Potter would defeat an evil witch"
        />
        <Input label="Give me a prompt" name="prompt" type="file" />
        <Button type="submit">Submit</Button>
      </form>
    </main>
  );
}
