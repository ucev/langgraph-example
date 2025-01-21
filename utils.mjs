import './loadenv.mjs';
import { ChatOpenAI } from '@langchain/openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ByteDanceDoubaoEmbeddings } from '@langchain/community/embeddings/bytedance_doubao';

export const getModel = (fields) => new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    ...fields,
    configuration: {
        basePath: process.env.OPENAI_API_BASE,
    }
})

export const getEmbeddings = () => new ByteDanceDoubaoEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL_EMBEDDING,
})

export const getFilePath = (current, target) => {
    const __filename = fileURLToPath(current)
    const __dirname = path.dirname(__filename)
    return path.join(__dirname, target)
}