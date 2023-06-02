import { Show } from 'solid-js';
import server$ from 'solid-start/server';
import { createStore } from 'solid-js/store';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { PromptTemplate } from 'langchain';
import { OpenAI } from 'langchain/llms/openai';
import party from 'party-js';
import { openai } from '../../services/index.js';
import { Form, Input, Button, Dialog, Svg } from '../../components/index.js';
import { STABILITY_API_KEY } from '../../config.js';
import { jsSubmitForm } from '../../utils.js';

const fightPairs = [
  // ['Water bender', 'Fire bender'],
  // ['Dogs', 'Cats'],
  // ['Star Trek cosplayers', 'Star Wars fan boys'],
  ['A dragon', 'A chimera'],
  ['A werewolf', 'A vampire'],
  ['Zeus', 'Hades'],
  ['A pirate', 'A ninja'],
  ['A knight', 'A viking'],
  ['Sherlock Holmes', 'Hercule Poirot'],
  // ['Unstoppable force', 'Immovable object'],
  // ['One horse-sized duck', '100 duck-sized horses'],
  // ['A bear with sharks for arms', 'A shark with bears for arms'],
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
    template: `Battle of {opponent1} ("opponent1") vs {opponent2} ("opponent2")? Provide a creative and details explanation why they would win and what tactics they would employ. Format the response as "winner: 'opponent1' or 'opponent2'. reason: the reason they won." Return the winner using only their label ("opponent1" or "opponent2") and not their name.`,
    inputVariables: ['opponent1', 'opponent2'],
    // partialVariables: { format_instructions: formatInstructions },
  });
  const input = await prompt.format({ opponent1, opponent2 });

  const model = new OpenAI({ temperature: 1, streaming: true });

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

const createImgAction = server$(async function (formData) {
  try {
    const { opponent1, opponent2, winner } = zfd
      .formData({
        opponent1: zfd.text(),
        opponent2: zfd.text(),
        winner: zfd.text(z.enum(['opponent1', 'opponent2'])),
      })
      .parse(formData);

    const mods = [
      /** Theme */
      // 'Abstract',
      // 'Academic',
      // 'Action painting',
      // 'Aesthetic',
      // 'Allover painting',
      // 'Angular',
      // 'Appropriation',
      // 'Architecture',
      // 'Artifice',
      // 'Automatism',
      // 'Avant-garde',
      // 'Baroque',
      // 'Bauhaus',
      // 'Contemporary',
      // 'Cubism',
      // 'Cyberpunk',
      'Digital art',
      'photo',
      // 'Expressionism',
      // 'Fantasy',
      // 'Impressionism',
      // 'kiyo-e',
      // 'Medieval',
      // 'Minimal',
      // 'Modern',
      // 'Pixel art',
      // 'Realism',
      // 'sci-fi',
      // 'Surrealism',
      // 'synthwave',
      // '3d-model',
      // 'analog-film',
      // 'anime',
      // 'cinematic',
      // 'comic-book',
      // 'digital-art',
      // 'enhance',
      // 'fantasy-art',
      // 'isometric',
      // 'line-art',
      // 'low-poly',
      // 'modeling-compound',
      // 'neon-punk',
      // 'origami',
      // 'photographic',
      // 'pixel-art',
      // 'tile-texture',

      /** Format */
      // '3D render',
      // 'Blender Model',
      // 'CGI rendering',
      'cinematic',
      // 'Detailed render',
      // 'oil painting',
      // 'unreal engine 5',
      // 'watercolor',

      /** Quality */
      // 'high resolution',
      // 'high-detail',
      // 'low-poly',
      // 'photographic',
      'photorealistic',
      // 'realistic',

      /** Effects */
      // 'Beautiful lighting',
      // 'Cinematic lighting',
      // 'Dramatic',
      // 'dramatic lighting',
      // 'Dynamic lighting',
      // 'epic',
      // 'Portrait lighting',
      // 'Volumetric lighting',
    ];

    const prompt = new PromptTemplate({
      template: `A battle between {opponent1} and {opponent2} where {${winner}} is winning, ${mods.join(
        ', '
      )}`,
      inputVariables: ['opponent1', 'opponent2'],
    });
    const input = await prompt.format({ opponent1, opponent2, winner });

    const response = await openai.createImage({
      prompt: input,
      n: 1,
      size: '512x512',
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
});

export default function () {
  const pair = fightPairs[Math.floor(Math.random() * fightPairs.length)];

  const [getState, setState] = createStore({
    text: '',
    loading: false,
    winner: '',
    reason: '',
  });

  const [getOptions, setOptions] = createStore({
    opponent1: pair[0],
    opponent2: pair[1],
  });
  // TODO: make options reactively reference state
  // const predictionOptions = [
  //   '',
  //   { label: 'Opponent 1', value: 'opponent1' },
  //   { label: 'Opponent 2', value: 'opponent2' },
  // ];
  const handleOpponentInput = (stateKey) => (event) => {
    setOptions({ [stateKey]: event.target.value });
  };

  /** @param {SubmitEvent} event */
  async function handleSubmitFight(event) {
    event.preventDefault();
    setState({ loading: true, text: '', winner: '' });

    await jsSubmitForm(event.target, {
      onData(chunk) {
        setState((previous) => ({ text: previous.text + chunk }));
      },
    });

    const matchPattern = /winner:\s+(\w+)\.\s+reason:\s+(.*)/gi;
    const matches = matchPattern.exec(getState.text);

    setState({
      loading: false,
      winner: matches?.length ? matches[1].toLowerCase() : undefined,
      reason: matches?.length ? matches[2] : undefined,
    });
    const winnerInput = document.querySelector(
      `textarea[name=${getState.winner}]`
    );
    if (winnerInput) {
      party.confetti(winnerInput, {
        count: 40,
        size: 2,
        spread: 15,
      });
    }
  }

  const [imgState, setImgState] = createStore({
    url: '',
    loading: false,
    showDialog: false,
  });

  /** @param {SubmitEvent} event */
  async function handleSubmitImg(event) {
    event.preventDefault();
    setImgState({ url: '', loading: true, showDialog: true });

    const data = await jsSubmitForm(event.target).then((r) => r.json());

    setImgState({
      url: data.data[0].url,
      loading: false,
    });
  }

  return (
    <main>
      <h1 class="text-3xl">Who Would Win In A Fight Between...</h1>
      <Form
        action={routeAction.url}
        method="post"
        class="grid gap-4"
        onSubmit={handleSubmitFight}
        onFocus={() => setState({ winner: '' })}
      >
        <div class="grid grid-cols-2 gap-4">
          <Input
            label={
              getState.winner === 'opponent1'
                ? 'Opponent 1 - Winner 🏆'
                : 'Opponent 1'
            }
            name="opponent1"
            type="textarea"
            required
            minlength="2"
            value={getOptions.opponent1}
            oninput={handleOpponentInput('opponent1')}
            classList={{
              rainbow: getState.winner === 'opponent1',
            }}
          />

          <Input
            label={
              getState.winner === 'opponent2'
                ? 'Opponent 2 - Winner 🏆'
                : 'Opponent 2'
            }
            name="opponent2"
            type="textarea"
            required
            minlength="2"
            value={getOptions.opponent2}
            oninput={handleOpponentInput('opponent2')}
            classList={{
              rainbow: getState.winner === 'opponent2',
            }}
          />
        </div>

        {/* TODO: Add random fight generator */}

        <div>
          <Button
            type={getState.loading ? 'button' : 'submit'}
            loading={getState.loading}
          >
            Tell me
          </Button>
        </div>
      </Form>

      {!!getState.text.length && <p>{getState.text.slice(29)}</p>}

      {getState.winner && (
        <Form
          action={createImgAction.url}
          method="post"
          onSubmit={handleSubmitImg}
        >
          <input
            name="opponent1"
            type="hidden"
            required
            value={getOptions.opponent1}
          />
          <input
            name="opponent2"
            type="hidden"
            required
            value={getOptions.opponent2}
          />
          <input
            name="winner"
            type="hidden"
            required
            value={getState.winner || 'opponent1'}
          />
          <Button type="submit" loading={imgState.loading}>
            Show me
          </Button>
        </Form>
      )}

      <Dialog
        toggle={false}
        open={imgState.showDialog}
        onClose={() => setImgState({ showDialog: false })}
      >
        <Show
          when={!imgState.loading}
          fallback={<Svg icon="icon-spinner" alt="loading" class="text-8xl" />}
        >
          <img
            src={imgState.url}
            alt={`An epic battle between ${getOptions.opponent1} and ${getOptions.opponent2}`}
          />
        </Show>
      </Dialog>
    </main>
  );
}
