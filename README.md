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
  - Copy some components
  - Copy some CSS
- Making your first request to OpenAI
  - Making fetch requests
  - env variables
  - Solid.js server$
- OpenAI client library
  - Learning about AI
  - Tokens
  - Nondeterministic output
  - Temperature
- Streaming responses
  - HTTP Streaming https://gist.github.com/CMCDragonkai/6bfade6431e9ffb7fe88
  - Browsers natively support chunked data
  - Node.js Streams https://nodejs.org/api/http.html#http_response_write_chunk_encoding_callback
  - Streaming with OpenAI
  - Readable Stream
- Prompt Engineering
  - Problem with blank inputs
  - It's sort of like learning how to Google 
  - Setting up credentials
  - Providing Examples: Zero-shot, one-shot, n-shot
  - Structured responses (and not)
    - JSON: good for multiple values. Can't be streamed
    - Text: can be streamed. unstructured
    - Respond with semi structured text
<!-- - Tooling: LangChain
  - Features: Chat memory, Caching, Timeouts, Cancel, Rate limits, Errors
  - Templates -->
- Deployment
  - Next level with database storing fights
  - Sharability
  - Image ownership, object storage, CDN
  - Self-host LLM
<!-- - Agents: BabyAGI, AutoGPT -->

"Apple restricts employees from using ChatGPT over fear of data leaks"

"Rogue Generative AI sites are distributing RedLine Malware"

"US senator introduces bill to create a federal agency to regulate AI"

"European Union Set to Be Trailblazer in Global Rush to Regulate Artificial Intelligence"