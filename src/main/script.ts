import {generateAspects, getAspectsFromDisk} from "./aspect_library";
import robot from "robotjs";
import {fillResearchArray, indexingAspect} from "./screen_capture";


export async function startScript() {
    generateAspects()
    robot.setMouseDelay(0)

    await getAspectsFromDisk()
    await indexingAspect()
    await fillResearchArray()



}