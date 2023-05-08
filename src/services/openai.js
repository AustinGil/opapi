import { Configuration, OpenAIApi } from 'openai';
import { createParser } from 'eventsource-parser';
import { OPENAI_API_KEY } from '../config.js';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
/**
 * @type {OpenAIApi & {
 * createStreamFromResponse: typeof createStreamFromResponse
 * }}
 */
// @ts-ignore
const openai = new OpenAIApi(configuration);

/**
 * @see https://github.com/Nutlope/twitterbio/blob/main/utils/OpenAIStream.ts
 * @param {Awaited<ReturnType<typeof openai.createCompletion>>} response
 */
export function createStreamFromResponse(response) {
  const decoder = new TextDecoder();
  let counter = 0;

  return new ReadableStream({
    async start(controller) {
      const parser = createParser((event) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].text || '';
            if (counter < 2 && /\n/.test(text)) {
              return;
            }
            controller.enqueue(text);
            counter++;
          } catch (error) {
            controller.error(error);
          }
        }
      });
      for await (const chunk of response.data) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
}

openai.createStreamFromResponse = createStreamFromResponse;

export default openai;
