import Jimp, {MIME_PNG} from "jimp";
import {Point, researchGetPosition} from "./screen_capture";
import {constants as c} from "../number_constants";
import {getAspectImage} from "./aspect_library";

export let preview: Jimp

export function setPreview(image: Jimp) {
    preview = image
}

export async function fillPreview(way: Array<{ point: Point, name: string }>) {
    let mask = await Jimp.read("images/research_mask.png")

    for (const wayElement of way) {
        let cord = researchGetPosition(wayElement.point)
        let point = {x: cord.x - c.research.x, y: cord.y - c.research.y}
        let aspectImage = getAspectImage(wayElement.name)
        if (aspectImage) {
            preview.composite(aspectImage.mask(mask, 0, 0), point.x, point.y)
        }
    }
}

export async function getBuffer() {
    return await preview.getBufferAsync(MIME_PNG)
}