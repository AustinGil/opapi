# SolidStart

Everything you need to build a Solid project, powered by [`solid-start`](https://start.solidjs.com);

## Creating a project

```bash
# create a new project in the current directory
npm init solid@latest

# create a new project in my-app
npm init solid@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Solid apps are built with _adapters_, which optimise your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different adapter, add it to the `devDependencies` in `package.json` and specify in your `vite.config.js`.

## TODO

https://github.com/ggerganov/llama.cpp
https://llama-node.vercel.app/
https://github.com/nomic-ai/gpt4all
https://cocktailpeanut.github.io/dalai/#/
https://huggingface.co/bigscience/bloom
https://huggingface.co/databricks/dolly-v2-12b
https://github.com/stability-AI/stableLM/
https://github.com/microsoft/prompt-engine
https://github.com/imartinez/privateGPT
https://github.com/eugeneyan/open-llms
https://github.com/go-skynet/LocalAI

## Outline
- Project Setup
  - Prerequisites (Node.js, NPM, OpenAI account, Akamai account for deployment)
    - https://nodejs.org/
    - https://openai.com/ LHpf!rmwrq6eY2^UCS9a
    - https://www.linode.com/austingil
    - https://github.com/AustinGil/versus
  - solid https://www.solidjs.com/
  - Tailwind https://tailwindcss.com/docs/guides/solidjs
  - Copy some CSS
  - Copy some components
  - https://github.com/AustinGil/versus
- Making your first request to OpenAI
  - Making fetch requests
  - openai npm package
  - env variables
  - Solid.js server$ and RPC
  - Form component
- Streaming responses
  - HTTP Streaming https://gist.github.com/CMCDragonkai/6bfade6431e9ffb7fe88
  - Browsers natively support chunked data
  - Node.js Streams https://nodejs.org/api/http.html#http_response_write_chunk_encoding_callback
  - Streaming with OpenAI
  - Readable Stream
- Learning about AI
  - Neural Networks & LLMs & GPT
    - AI, or articifial inteligence is the concept of creating machines that can think, learn, and reason. It's the goal of study field of Machine Learning, which focuses on many different tools, methods, and practices to teach computers.
    - One of these methods is Artificial Neural networks which inspired by human biology and the way neurons of the human brain function together to understand inputs from human senses. 
    - Neural networks are like brains with various associations (neural connections) between concepts.
    - https://www.computerworld.com/article/3697649/what-are-large-language-models-and-how-are-they-used-in-generative-ai.html
    - LLMs are a subset of neural networks where the connections are formed on top of a language, mostly the English internet.
    - LLMs are controlled by "parameters", billions, and even trillions of them. (Think of a parameter as something that helps an LLM decide between different answer choices.)
    - When provided an input, they constuct answers based on a probability of the next word, within their context, and according to the strength of connection between words. These are called embeddings.
    - Embeddings: a list of numbers that can be used to chart the semantic similarity between two things, or words
    - You can kind of think of it as like x-y coordinates
    - https://i.redd.it/a-mostly-complete-guide-to-neural-networks-v0-6wyxhu2cyuna1.jpg?s=d021155e25811f6f103c02ea8dfefba534d16955
    - https://partee.io/images/posts/vector-embeddings/embedding-creation.png
    - https://miro.medium.com/v2/resize:fit:1400/1*sAJdxEsDjsPMioHyzlN3_A.png
    - LLMs can be trained on whatever specific data, or in the case of ChatGPT, whatever is scraped off the open web.
    - Generative pre-trained transformers (GPT) are a type of large language model (LLM), a subset neural network models that uses the transformer architecture
    - GPT llm = a computer algorithm that processes natural language inputs and predicts the next word based on what it’s already seen. Then it predicts the next word, and the next word, and so on until its answer is complete.
    - They take some input and try to provide the next logical output, based on the data upon which they were trained.
  - Nondeterministic output
    - Probabilistic responses
    - banana & bread, pudding, cream pie is closer than banana & hammock
  - Accuracy & hallucinations 
    - Junk in, junk out
    - LLMs, in their in most vanilla form, don’t have an internal state representation of the world
    - When an LLM returns "banana bread", it has no idea what a banana bread is, or even banana, or bread. It just knows that those are commonly found together.
- Prompt Engineering
  - https://www.computerworld.com/article/3691253/how-to-train-your-chatbot-through-prompt-engineering.html
  - Problem with blank inputs
  - Tokens (https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)
    - Token pricing is based on the model
  - Temperature
  - It's sort of like learning how to Google 
  - Setting up credentials
  - Providing Examples: Zero-shot, one-shot, n-shot
  - Structured responses (and not)
    - JSON: good for multiple values. Can't be streamed
    - Text: can be streamed. unstructured
    - Respond with semi structured text
  - Tooling: LangChain
    - Features: Chat memory, Caching, Timeouts, Cancel, Rate limits, Errors
    - Templates
    - Output parsers
- Img generation
- Deploys
  - npm run qwik add
  - git push
  - ssh
  - sudo apt update
  - sudo apt install git
  - git clone https://github.com/AustinGil/versus.git
  - install NVM & node
    - https://github.com/nvm-sh/nvm#install--update-script
    - curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
    - exit
    - nvm install node
  - cd versus
  - npm install
  - npm run build
  - npm run build.server
  - ORIGIN=https://example.com npm run serve
  - npm install -g pm2
  - OPENAI_API_KEY="API_KEY" pm2 start "npm run serve"
  - pm2 startup
  - Configure Caddy server https://caddyserver.com/docs/install#debian-ubuntu-raspbian
  - Open server IP
  - Edit caddy file
    - nano /etc/caddy/Caddyfile
    - reverse_proxy localhost:3000
  <!-- - install docker & compose -->
- Closing
  - Security & prompt injection & zod https://simonwillison.net/2022/Sep/12/prompt-injection/
    - goal hijacking & prompt leakage
    - treat output as untrusted
  - LangChain
  - Self-host Generic Graph Machine Learning (GGML) Alternatives
    - Some company block llm use to protect IP and secret 
    - Deployment (High-memory instances)
    - Download from https://github.com/nomic-ai/gpt4all/tree/main/gpt4all-chat
  - Huggingface
  - Next level with database storing fights
  - Sharability
  - Image ownership, object storage, CDN
<!-- - Agents: BabyAGI, AutoGPT -->

"Apple restricts employees from using ChatGPT over fear of data leaks"

"Rogue Generative AI sites are distributing RedLine Malware"

"US senator introduces bill to create a federal agency to regulate AI"

"European Union Set to Be Trailblazer in Global Rush to Regulate Artificial Intelligence"