import { z } from 'zod';

export const OPENAI_API_KEY = z.string().parse(process.env.OPENAI_API_KEY);
