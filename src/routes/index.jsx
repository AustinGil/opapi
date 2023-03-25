import { createServerAction$ } from 'solid-start/server';
import { zfd } from 'zod-form-data';
import { openai } from '../services/index.js';
import { Input } from '../components';

/**
 * @param {FormData} form
 * @param {Parameters<Parameters<typeof createServerAction$>[0]>[1]} context
 */
const homeAction = async function (form, context) {
  const { prompt } = zfd
    .formData({
      prompt: zfd.text(),
    })
    .parse(form);

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    temperature: 0,
    max_tokens: 7,
  });

  return response.data;
};

export default function Home() {
  const [request, action] = createServerAction$(homeAction);

  return (
    <main>
      <action.Form>
        <Input
          label="Give me a prompt"
          name="prompt"
          type="textarea"
          value="Tell me a joke about Stoney Eagle"
        />

        <button>{request.pending ? 'Loading...' : 'Submit'}</button>
      </action.Form>

      <pre>{JSON.stringify(request, null, 2)}</pre>
    </main>
  );
}
