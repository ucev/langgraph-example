import './loadenv.mjs';
import { ChatOpenAI } from '@langchain/openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ByteDanceDoubaoEmbeddings } from '@langchain/community/embeddings/bytedance_doubao';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import * as d3 from 'd3';
import { createCanvas } from 'canvas';

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

export async function printGraph(graph) {
    const image = await graph.drawMermaidPng();
    const arrayBuffer = await image.arrayBuffer();

    return Deno.jupyter.image(new Uint8Array(arrayBuffer))
}

export const chartTool = tool(
    async ({ data }) => {
        const width = 500
        const height = 500
        const margin = { top: 20, right: 30, bottom: 30, left: 40 }
        
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        const x = d3
            .scaleBand()
            .domain(data.map(d => d.label))
            .range([margin.left, width - margin.right])
            .padding(0.1)
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.value) ?? 0])
            .nice()
            .range([height - margin.bottom, margin.top])
        
        const colorPalette = [
            "#e6194B",
            "#3cb44b",
            "#ffe119",
            "#4363d8",
            "#f58231",
            "#911eb4",
            "#42d4f4",
            "#f032e6",
            "#bfef45",
            "#fabebe",
        ]
        data.forEach((d, idx) => {
            ctx.fillStyle = colorPalette[idx % colorPalette.length]
            ctx.fillRect(
                x(d.label) ?? 0,
                y(d.value),
                x.bandwidth(),
                height - margin.bottom - y(d.value),
            )
        })

        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.moveTo(margin.left, height - margin.bottom)
        ctx.lineTo(width - margin.right, height - margin.bottom)
        ctx.stroke()

        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        x.domain().forEach((d) => {
            const xCoord = (x(d) ?? 0) + x.bandwidth() / 2
            ctx.fillText(d, xCoord, height - margin.bottom + 6)
        })

        ctx.beginPath()
        ctx.moveTo(margin.left, height - margin.top)
        ctx.lineTo(margin.left, height - margin.bottom)
        ctx.stroke()

        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        const ticks = y.ticks()
        ticks.forEach((d) => {
            const yCoord = y(d)
            ctx.moveTo(margin.left, yCoord)
            ctx.lineTo(margin.left - 6, yCoord)
            ctx.stroke()
            ctx.fillText(d.toString(), margin.left - 8, yCoord)
        })
        const buffer = canvas.toBuffer()
        // 这个方法很重要
        await displayImage(buffer)
        return 'Chart has been generated and displayed to the user!'
    },
    {
        name: 'generate_bar_chart',
        description: 'Generates a bar chart from an array of data points using D3.js and displays it for the user.',
        schema: z.object({
            data: z
                .object({
                    label: z.string(),
                    value: z.number(),
                }).array(),
        })
    }
)