import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from '../config.js';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
export default new OpenAIApi(configuration);

// const response = await openai.createCompletion({
//   model: 'text-davinci-003',
//   prompt: 'Say this is a test',
//   temperature: 0,
//   max_tokens: 7,
// });
// process.env.TEST
