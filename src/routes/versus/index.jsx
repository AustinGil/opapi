import { Show } from 'solid-js';
import server$ from 'solid-start/server';
import { createStore } from 'solid-js/store';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { PromptTemplate } from 'langchain';
import { OpenAI } from 'langchain/llms/openai';
import party from 'party-js';
import { openai } from '../../services/index.js';
import {
  Form,
  Input,
  Button,
  Svg,
  Card,
  Dialog,
} from '../../components/index.js';
import { jsSubmitForm } from '../../utils.js';

const fightPairs = [
  ['A dragon', 'A chimera'],
  ['A werewolf', 'A vampire'],
  ['Zeus', 'Hades'],
  ['A pirate', 'A ninja'],
  ['A knight', 'A viking'],
  ['Sherlock Holmes', 'Hercule Poirot'],
  ['A ghost', 'A demon'],
  ['A squirrel', 'A rabbit'],
  ['An oak tree', 'A tractor'],
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

  const prompt = new PromptTemplate({
    template: `Battle of {opponent1} ("opponent1") vs {opponent2} ("opponent2")? Provide a creative and details explanation why they would win and what tactics they would employ. Format the response as "winner: 'opponent1' or 'opponent2'. reason: the reason they won." Return the winner using only their label ("opponent1" or "opponent2") and not their name.`,
    inputVariables: ['opponent1', 'opponent2'],
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
  const [getState, setState] = createStore({
    text: '',
    loading: false,
    winner: '',
  });

  const [getOptions, setOptions] = createStore({
    opponent1: '',
    opponent2: '',
  });
  const handleOpponentInput = (stateKey) => (event) => {
    setOptions({ [stateKey]: event.target.value });
  };
  function setRandomFight() {
    const pair = fightPairs[Math.floor(Math.random() * fightPairs.length)];
    setState({ winner: '', text: '' });
    setOptions({
      opponent1: pair[0],
      opponent2: pair[1],
    });
  }

  /** @param {SubmitEvent} event */
  async function handleSubmitFight(event) {
    event.preventDefault();
    setState({ loading: true, text: '', winner: '' });

    await jsSubmitForm(event.target, {
      onData(chunk) {
        setState((previous) => ({ text: previous.text + chunk }));
      },
    });

    const matchPattern = /winner:\s+(\w+)\.\s+reason:\s+.*/gi;
    const matches = matchPattern.exec(getState.text);

    setState({
      loading: false,
      winner: matches?.length ? matches[1].toLowerCase() : undefined,
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
      <h1 class="text-3xl my-8">Who Would Win In A Fight Between...</h1>

      <Form
        action={routeAction.url}
        method="post"
        class="grid gap-4"
        onSubmit={handleSubmitFight}
        oncapture:input={() => setState({ winner: '' })}
      >
        <div class="grid sm:grid-cols-2 gap-4">
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

        <div class="flex gap-4 items-center">
          <Button
            type={getState.loading ? 'button' : 'submit'}
            loading={getState.loading}
          >
            Tell me
          </Button>

          <Button
            type="button"
            class="inline-grid !border-transparent !p-0 text-3xl !text-inherit !bg-transparent"
            onClick={setRandomFight}
            title="Generate pair"
          >
            <Svg icon="icon-dice" alt="Random" />
          </Button>
        </div>
      </Form>

      {!!getState.text.length && (
        <Card class="my-4">
          <p>{getState.text.slice(29)}</p>
        </Card>
      )}

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

      <p class="mt-10 sm:mt-20 text-center">
        Disclaimer: This app uses AI, which means things may come out a lil
        wonky sometimes
      </p>
    </main>
  );
}
