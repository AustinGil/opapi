import { createServerAction$ } from 'solid-start/server';
import { createEffect, onCleanup, Show, onMount } from 'solid-js';
import { zfd } from 'zod-form-data';
import { openai, uploads } from '../services/index.js';
import { Input, Button } from '../components';

/**
 * @see https://github.com/solidjs/solid-start/blob/main/examples/with-websocket/src/routes/sse.tsx
 * @see https://twitter.com/Steve8708/status/1644377554034503680
 */

/**
 * @param {FormData} _
 * @param {Parameters<Parameters<typeof createServerAction$>[0]>[1]} context
 */
const homeAction = async function (_, context) {
  const form = await uploads.parseMultipartRequest(context.request);

  const { prompt } = zfd
    .formData({
      prompt: zfd.text(),
    })
    .parse(form);

  // const audio = form.get('audio');

  // eslint-disable-next-line no-useless-escape
  // return `\n\nQ: What did the Stoney Eagle say when it saw a plane flying overhead?\nA: \"Eagle eye!\"`.slice(
  //   2
  // );

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    temperature: 0,
    max_tokens: 500,
    stream: true,
  });

  return response.data.choices[0].text;
};

export default function Home() {
  const [request, action] = createServerAction$(homeAction);
  createEffect(() => {
    const eventSource = new EventSource(action.url);

    eventSource.addEventListener('chat', (event) => {
      console.log(event);
    });

    onCleanup(() => eventSource.close());
  });

  onMount(() => {
    const index = document.querySelector('input[type="file"');
    if (!index) return;
    const dt = new DataTransfer();
    dt.items.add(new File(['content'], 'temp.txt'));
    index.files = dt.files;
  });

  return (
    <main>
      <action.Form>
        <Input label="Audio File" name="audio" type="file" />
        <Input
          label="Give me a prompt"
          name="prompt"
          type="textarea"
          value="Tell me a story about the fresh prince of bell air"
        />

        <Button type="submit">
          {request.pending ? 'Loading...' : 'Submit'}
        </Button>
      </action.Form>

      <input type="checkbox" checked />

      <Show when={!request.pending && request.result != undefined}>
        <p class="whitespace-pre-wrap">{request.result}</p>
      </Show>
    </main>
  );
}
