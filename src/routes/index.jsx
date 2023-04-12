import server$, { createServerAction$, eventStream } from 'solid-start/server';
import { createEffect, createSignal, onCleanup, Show, onMount } from 'solid-js';
import { openai, uploads } from '../services/index.js';
import { Input, Button } from '../components';
import { z } from 'zod';

import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

const serverFunction = server$(async function (form, request) {
  const prompt = z.string().parse(form.get('prompt'));

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await openai.createChatCompletion(
    {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 100,
      stream: true,
      n: 1,
    },
    { responseType: 'stream' }
  );

  // const res = await fetch('https://api.openai.com/v1/chat/completions', {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
  //   },
  //   method: 'POST',
  //   body: JSON.stringify({
  //     model: 'gpt-3.5-turbo',
  //     messages: [
  //       {
  //         role: 'user',
  //         content: prompt,
  //       },
  //     ],
  //     temperature: 0.7,
  //     top_p: 1,
  //     frequency_penalty: 0,
  //     presence_penalty: 0,
  //     max_tokens: 100,
  //     stream: true,
  //     n: 1,
  //   }),
  // });

  const stream = new ReadableStream({
    async start(controller) {
      /** @param {ParsedEvent | ReconnectInterval} event */
      function onParse(event) {
        if (event.type === 'event') {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            /**
             * Chat Data:
             * data: {"id":"chatcmpl-74e5W3iHLdixvxeqOUEHrOY0vzrN5","object":"chat.completion.chunk","created":1681341766,"model":"gpt-3.5-turbo-0301","choices":[{"delta":{"role":"assistant"},"index":0,"finish_reason":null}]}
             *
             * Completion Data:
             * data: {"id": "cmpl-74e2oF4Hoqfz5duNHWKXjvM0ANCGp", "object": "text_completion", "created": 1681341598, "choices": [{"text": "\n", "index": 0, "logprobs": null, "finish_reason": null}], "model": "text-davinci-003"}
             */
            const text = json.choices[0].delta?.content || '';
            if (counter < 2 && (text.match(/\n/) || []).length > 0) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (error) {
            // maybe parse error
            controller.error(error);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.data) {
        console.log(chunk.toString());
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return new Response(stream);
});

/**
 * @see https://twitter.com/Steve8708/status/1644377554034503680
 * @see https://github.com/Nutlope/twitterbio/blob/main/utils/OpenAIStream.ts
 */

export default function () {
  let [state, setState] = createSignal('');
  /**
   * @param {SubmitEvent} event
   */
  async function handleClick(event) {
    event.preventDefault();
    const form = /** @type {HTMLFormElement} */ (event.target);
    const url = new URL(form.action);
    const response = await fetch(url, {
      method: form.method,
      body: new FormData(form),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = response.body; // ReadableStream
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
      console.log(chunkValue);
      setState((previous) => {
        return previous + chunkValue;
      });
    }

    // createEffect(() => {
    //   const eventSource = new EventSource(serverFunction.url);

    //   eventSource.addEventListener('chat', (event) => {
    //     console.log(event);
    //     setState(event.data);
    //   });

    //   onCleanup(() => eventSource.close());
    // });
    event.preventDefault();
  }

  return (
    <main>
      {state()}
      <form action={serverFunction.url} method="post" onSubmit={handleClick}>
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
