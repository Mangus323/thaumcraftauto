import {generateAspects, getLinks} from "./aspect_library";
import robot from "robotjs";
import {fillResearchTable, fillKnowledgeTable} from "./screen_capture";
import {alg} from "./algorithm";


export async function startScript() {
    await fillArrays()
    robot.setMouseDelay(0)

    //console.log(getLinks("motus", "gelum")) исправить
    //await alg();
}

async function fillArrays() {
    await generateAspects()
    await fillKnowledgeTable()
    await fillResearchTable()
}
