import { Show } from 'solid-js';
import server$, { createServerAction$ } from 'solid-start/server';
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

const allFighters = [
  // Mythological
  'Zeus',
  'Hades',
  'Hercules',
  'Cerberus',
  'Bahamut',
  'A dragon',
  'A chimera',
  'A unicorn',
  'A centaur',
  'A basilisk',
  'A giant cyclops',
  // Cryptids
  'A chupacabra',
  'The Lock Ness Monster',
  'Big Foot',
  'A yeti',
  'Mothman',
  // Fantasy
  'A werewolf',
  'A vampire',
  'An elf',
  'An ogre',
  'A goblin',
  'A griffin',
  'A zombie',
  'A kraken',
  // Sci-fi
  'A ghost',
  'A demon',
  'An alien',
  'A shapeshifter',
  'A body-snatcher',
  'Cthulhu',
  // People
  'A pirate',
  'A ninja',
  'A samurai',
  'A knight',
  'A viking',
  'Sherlock Holmes',
  'Hercule Poirot',
  // Animals
  'A rabid squirrel',
  'A raccoon with a knife',
  'An angry mongoose',
  'A king cobra',
  'A komodo dragon',
  'A silverback gorilla',
  'A hippopotamus',
  'A lion, tiger, and bear',
];

const opponentSchema = zfd.text(z.string().max(100));

const createImgAction = server$(async function (formData) {
  try {
    const { opponent1, opponent2, winner } = zfd
      .formData({
        opponent1: opponentSchema,
        opponent2: opponentSchema,
        winner: zfd.text(z.enum(['opponent1', 'opponent2'])),
      })
      .parse(formData);

    const mods = [
      /** Style */
      // 'Abstract',
      // 'Academic',
      // 'Action painting',
      // 'Aesthetic',
      // 'Angular',
      // 'Automatism',
      // 'Avant-garde',
      // 'Baroque',
      // 'Bauhaus',
      // 'Contemporary',
      // 'Cubism',
      // 'Cyberpunk',
      // 'Digital art',
      // 'photo',
      // 'vector art',
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
      // 'comic-book',
      // 'enhance',
      // 'fantasy-art',
      // 'isometric',
      // 'line-art',
      // 'low-poly',
      // 'modeling-compound',
      // 'origami',
      // 'photographic',
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
      // 'cartoon',
      // 'anime'
      // 'colored pencil'

      /** Quality */
      'high resolution',
      // 'high-detail',
      // 'low-poly',
      // 'photographic',
      // 'photorealistic',
      // 'realistic',

      /** Effects */
      // 'Beautiful lighting',
      // 'Cinematic lighting',
      // 'Dramatic',
      // 'dramatic lighting',
      // 'Dynamic lighting',
      'epic',
      // 'Portrait lighting',
      // 'Volumetric lighting',
    ];

    const prompt = new PromptTemplate({
      template: `{opponent1} and {opponent2} in a battle to the death, ${mods.join(
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
  const [routeAction, action] = createServerAction$(async function (formData) {
    const { opponent1, opponent2 } = zfd
      .formData({
        opponent1: opponentSchema,
        opponent2: opponentSchema,
      })
      .parse(formData);

    const prompt = new PromptTemplate({
      template: `Who would win in a fight between {opponent1} ("opponent1") and {opponent2} ("opponent2")? Provide a creative and details explanation why they would win and what tactics they would employ. Format the response as "winner: opponent1 or opponent2. reason: the reason they won." Return the winner using only their label ("opponent1" or "opponent2") and not their name.`,
      inputVariables: ['opponent1', 'opponent2'],
    });
    const input = await prompt.format({ opponent1, opponent2 });

    const response = await openai.createCompletion(
      {
        model: 'text-davinci-003',
        prompt: input,
        temperature: 0,
        max_tokens: 100,
        stream: true,
      },
      { responseType: 'stream' }
    );

    return new Response(
      new ReadableStream({
        async start(controller) {
          response.data.on('data', (data) => {
            console.log(`s:${data.toString()}:e`);
            data = data.toString().slice(6).trim();
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            data = data.replace(/\n/g, '\\n');
            const json = JSON.parse(data);
            const text = json.choices[0].text || '';
            controller.enqueue(text);
          });
        },
      })
    );
    // You're a professional fighting judge from Liverpool and you speak mostly in cockney slang

    // https://regex101.com/r/R4QgmZ/1
    // const regex = /data:\s*(.*)/g;
    // let match;
    // while ((match = regex.exec(text)) !== null) {
    //   console.log(match[1]); // logs each captured instance of content after 'data:'
    // }

    // return new Response(
    //   new ReadableStream({
    //     start(controller) {
    //       (function inc(val) {
    //         controller.enqueue(val.toString());
    //         setTimeout(() => {
    //           if (!val) {
    //             controller.close();
    //             return;
    //           }
    //           inc(val - 1);
    //         }, 1000);
    //       })(4);
    //     },
    //   })
    // );

    // const model = new OpenAI({ temperature: 1, streaming: true });

    // const stream = new ReadableStream({
    //   async start(controller) {
    //     model.call(input, undefined, [
    //       {
    //         handleLLMNewToken(token) {
    //           controller.enqueue(token);
    //         },
    //         handleLLMEnd() {
    //           controller.close();
    //         },
    //       },
    //     ]);
    //   },
    // });
    // return new Response(stream);
  });

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
    const fighters = [...allFighters];
    const i1 = Math.floor(Math.random() * fighters.length);
    const fighter1 = fighters.splice(i1, 1)[0];
    const i2 = Math.floor(Math.random() * fighters.length);
    const fighter2 = fighters[i2];

    setState({ winner: '', text: '' });
    setOptions({
      opponent1: fighter1,
      opponent2: fighter2,
    });
  }

  /** @param {SubmitEvent} event */
  async function handleSubmitFight(event) {
    event.preventDefault();

    setState({ loading: true, text: '', winner: '' });

    const response = await action(new FormData(event.target));

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let processNextChunk = true;

    while (processNextChunk) {
      const { value, done } = await reader.read();
      const chunkValue = decoder.decode(value);
      setState((previous) => ({ text: previous.text + chunkValue }));
      processNextChunk = !done;
    }

    // if (!prompt.result) return
    // // console.log(prompt.result)
    // // setText(prompt.result?.trim())
    // const reader = prompt.result.body.getReader();
    // const decoder = new TextDecoder();
    // let processNextChunk = true;

    // while (processNextChunk) {
    //   const { value, done } = await reader.read();
    //   const chunkValue = decoder.decode(value);
    //   setText((previous) => (previous + chunkValue))
    //   // setState((previous) => ({ text: previous.text + chunkValue }));
    //   processNextChunk = !done;
    // }

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
      <h1 class="text-5xl mt-8">AI of the Tiger</h1>
      <p class="mb-8">
        An AI tool to determine who would win in a fight between...
      </p>

      <action.Form
        class="grid gap-4"
        onSubmit={handleSubmitFight}
        oncapture:input={() => setState({ winner: '', text: '' })}
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
      </action.Form>

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
        Disclaimer: This app uses AI to generate content, so things may come out
        a lil wonky sometimes
      </p>

      <footer class="my-10 sm:mt-20 px-4 text-center">
        <p>
          Built by <a href="https://austingil.com">Austin Gil</a>. Powered
          by <a href="https://www.akamai.com/">Akamai Connected Cloud</a>.
        </p>
        <p>
          <a href="https://linode.com/austingil">
            Get $100 in free cloud computing credits.
          </a>
        </p>
      </footer>
    </main>
  );
}
