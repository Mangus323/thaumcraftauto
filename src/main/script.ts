import {getLinks, generateAspects, getAspectsFromDisk} from "./aspect_library";
import robot from "robotjs";
import {fillResearchArray, indexingKnowledgeAspects} from "./screen_capture";
import {alg} from "./algorithm";


export async function startScript() {
    generateAspects()
    robot.setMouseDelay(0)

    await getAspectsFromDisk()

    let a = getLinks("terra", "fabrico")
    a.forEach((item) => {
        console.log(item)
    })
    // await indexingKnowledgeAspects()
    // await fillResearchArray()
    // await alg();




}