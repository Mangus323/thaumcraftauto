import {generateAspects} from "./aspect_library";
import robot from "robotjs";
import {fillResearchTable, fillKnowledgeTable} from "./screen_capture";
import {alg} from "./algorithm";
import {fillPreview} from "./preview";


export async function startScript(clicked: number) {
    if (clicked === 0) {
        await fillArrays()
        robot.setMouseDelay(0)
    }
    await fillResearchTable()
    let way = await alg()
    await fillPreview(way)
}

async function fillArrays() {
    await generateAspects()
    await fillKnowledgeTable()
}
