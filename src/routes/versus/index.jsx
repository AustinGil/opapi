import server$ from 'solid-start/server';
import { createStore } from 'solid-js/store';
import { zfd } from 'zod-form-data';
import { PromptTemplate } from 'langchain';
// import { StructuredOutputParser } from 'langchain/output_parsers';
// import { openai } from '../../services/index.js';
import { Form, Input, Button } from '../../components/index.js';
import { OpenAI } from 'langchain/llms/openai';

const sillyPairs = [
  ['Water bender', 'Fire bender'],
  ['Unstoppable force', 'Immovable object'],
  ['One horse-sized duck', '100 duck-sized horses'],
  ['A bear with sharks for arms', 'A shark with bears for arms'],
];

const routeAction = server$(async function (formData) {
  const { opponent1, opponent2 } = zfd
    .formData({
      opponent1: zfd.text(),
      opponent2: zfd.text(),
    })
    .parse(formData);

  // const response = await openai.createCompletion(
  //   {
  //     model: 'text-davinci-003',
  //     prompt: prompt,
  //     temperature: 0,
  //     max_tokens: 1000,
  //     stream: true,
  //   },
  //   { responseType: 'stream' }
  // );
  // const stream = openai.createStreamFromResponse(response);

  // const parser = StructuredOutputParser.fromNamesAndDescriptions({
  //   winner: "winner's label (opponent1 or opponent2)",
  //   reasoning: 'reasoning',
  // });
  // const formatInstructions = parser.getFormatInstructions();
  const prompt = new PromptTemplate({
    template:
      'Who would win in a fight between the following two opponents? Provide an explanation why. Format the response as `winner: either opponent1 or opponent2. reason: the reason they won.` Select the winner using their label (opponent1 or opponent2), not their name. \nHere are the opponents: \nopponent1: {opponent1}\nopponent2: {opponent2}',
    inputVariables: ['opponent1', 'opponent2'],
    // partialVariables: { format_instructions: formatInstructions },
  });
  const input = await prompt.format({ opponent1, opponent2 });

  const model = new OpenAI({ temperature: 0, streaming: true });

  const stream = new ReadableStream({
    async start(controller) {
      model.call(input, undefined, [
        {
          handleLLMNewToken(token) {
            controller.enqueue(token);
          },
          handleLLMEnd() {
            controller.close();
          },
        },
      ]);
    },
  });
  return new Response(stream);

  // const response = await model.call(input);
  // return parser.parse(response);
});

export default function () {
  const pair = sillyPairs[Math.floor(Math.random() * sillyPairs.length)];

  const [getState, setState] = createStore({
    text: '',
    loading: false,
  });

  const [getOptions, setOptions] = createStore({
    opponent1: pair[0],
    opponent2: pair[1],
  });
  // TODO: make options reactively reference state
  const predictionOptions = [
    '',
    { label: 'Opponent 1', value: 'opponent1' },
    { label: 'Opponent 2', value: 'opponent2' },
  ];
  const handleOpponentInput = (stateKey) => (event) => {
    setOptions({ [stateKey]: event.target.value });
  };

  /**
   * @param {SubmitEvent} event
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setState({ loading: true, text: '' });
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
    // Winner: Opponent1. Reason:
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      const chunkValue = decoder.decode(value);
      console.log(chunkValue, done);
      setState((previous) => ({ text: previous.text + chunkValue }));
    }

    console.log('state:', getState.text);

    // /winner:\s+(\w+)\.\s+reason:\s+(.*)/
    // /^(?:winner: )(\w+). (?:reason: )(.+)$/i
    // const matchPattern = /winner:\s+(\w+)\.\s+reason:\s+(.*)/gi;

    setState({ loading: false });
  }

  // function createImage() {
  //   const response = await openai.createImage({
  //     prompt: "a white siamese cat",
  //     n: 1,
  //     size: "1024x1024",
  //   });
  //   image_url = response.data.data[0].url;
  // }

  return (
    <main>
      <h1 class="text-3xl">Who Would Win In A Fight</h1>

      {getState.text.slice(29)}

      <Form
        action={routeAction.url}
        method="post"
        class="grid gap-4"
        onSubmit={handleSubmit}
      >
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

      {getState.loading.toString()}

      {/* TODO: Generate AI image of epic battle between both opponent's and depict reasoning */}
    </main>
  );
}
