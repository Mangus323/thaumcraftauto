import {generateAspects, getAspectsFromDisk} from "./aspect_library";
import robot from "robotjs";
import {fillResearchArray, indexingAspect} from "./screen_capture";
// @ts-ignore
import {alg} from "./algorithm";


export async function startScript() {
    generateAspects()
    robot.setMouseDelay(0)

    await getAspectsFromDisk()
    await indexingAspect()
    await fillResearchArray()
    await alg();
    //await move();

}