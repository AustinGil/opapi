import server$ from 'solid-start/server';
import { createSignal, } from 'solid-js';
import { createStore } from "solid-js/store";
import { zfd } from 'zod-form-data';
import { PromptTemplate } from 'langchain';
import { StructuredOutputParser } from "langchain/output_parsers";
import { openai } from '../../services/index.js';
import { Form, Input, Button } from '../../components/index.js';

const routeAction = server$(async function (formData) {
  const { opponent1, opponent2 } = zfd
    .formData({
      opponent1: zfd.text(),
      opponent2: zfd.text(),
    })
    .parse(formData);


  const template = `Who would win in a fight between the following two competitors? Describe the strengths, weaknesses, and strategies to justify your position.

  opponent1: {opponent1}
  opponent2: {opponent2}` // {format_instructions}`;

  // const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
  //   winner: "winner's label",
  //   reasoning: "reasoning",
  // });

  // const formatInstructions = outputParser.getFormatInstructions();

  const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ["opponent1", "opponent2"],
    // partialVariables: { format_instructions: formatInstructions },
  });

  // TODO: Response should be JSON with clear winner and reasoning

  let prompt = await promptTemplate.format({ opponent1, opponent2 });

  prompt += `
  The output should be formatted as a JSON instance that conforms to the JSON schema below.

  { "type": "object", "properties": { "winner": { "type": "string", "description": "winner's label" }, "reasoning": { "type": "string", "description": "reasoning of the decision" } }, "required": ["winner", "reasoning"], "additionalProperties": false, "$schema": "http://json-schema.org/draft-07/schema#" }
  `

  prompt += `
  
  Pwetty pweeze 🥺
  `

  // console.log(formatInstructions, prompt)

  const response = await openai.createCompletion(
    {
      model: 'text-davinci-003',
      prompt: prompt,
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
  let [getState, setState] = createSignal('');

  const [getOptions, setOptions] = createStore({
    opponent1: 'a bear with sharks for arms',
    opponent2: 'a shark with bears for arms'
  });
  // TODO: make options reactively reference state
  const predictionOptions = [
    '',
    { label: 'Opponent 1', value: 'opponent1' },
    { label: 'Opponent 2', value: 'opponent2' }
  ]
  const handleOpponentInput = (stateKey) => (event) => {
    console.log(stateKey, event)
    setOptions({ [stateKey]: event.target.value });
  }

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

  return (
    <main>
      <h1 class="text-3xl">Who Would Win In A Fight</h1>

      {getState()}

      <Form action={routeAction.url} method="post" class="grid gap-4" onSubmit={handleSubmit}>
        <div class="grid grid-cols-2 gap-4">
          <Input
            label="Opponent 1"
            name="opponent1"
            type="textarea"
            required
            minlength="2"
            value={getOptions.opponent1}
            oninput={handleOpponentInput('opponent1')}
          />

          <Input
            label="Opponent 2"
            name="opponent2"
            type="textarea"
            required
            minlength="2"
            value={getOptions.opponent2}
            oninput={handleOpponentInput('opponent2')}
          />
        </div>

        <Input
          label="Prediction"
          name="prediction"
          type="select"
          options={predictionOptions}
        />

        {/* TODO: Add random fight generator */}

        <div>
          <Button type="submit">Fight!</Button>
        </div>
      </Form>

      {/* TODO: Generate AI image of epic battle between both opponent's and depict reasoning */}
    </main>
  );
}
