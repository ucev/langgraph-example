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

/**
 * 直接调用Deno.jupyter.image只能在有限情形下显示出图片
 * 我这个方法更通用
 */
export const displayImage = async (data) => {
    const result = Deno.jupyter.image(data)
    const formattedData = await result[Deno.jupyter.$display]()
    await Deno.jupyter.broadcast("execute_result", {
        // 当然这里可能会导致一些统计上的问题，不过实现功能更重要
        execution_count: 1,
        data: formattedData,
        metadata: {},
    })
    return null
}