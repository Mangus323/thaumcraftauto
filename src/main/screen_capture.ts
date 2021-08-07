import Jimp from "jimp"
import pixelmatch from "pixelmatch"
import screenshot from "screenshot-desktop"
import {aspects, generateAspects, Aspect} from "./aspect_library"
import {PNG} from "pngjs";
import fs from "fs"

const interval = 64
const baseX = 490
const baseY = 185

export let aspectsFromDisk: Map<string, Jimp> = new Map()
export let rawAspect: Array<Array<Jimp>> = [];
let aspectPosition = new Map()

async function checkScreen(screenshot: Jimp) {
    let fullscreen = screenshot.resize(1920, 1080)
    let mask = await Jimp.read("images/mask.png") // убрать числа
    await compareAspects(fullscreen, mask)

}

async function compareAspects(fullscreen: Jimp, mask: Jimp) {
    generateAspects()
    await getAllAspects();
    let aspectsArray = [...aspects]

    for (let i = 0; i < 5; i++) {
        rawAspect[i] = [];
        for (let j = 0; j < 5; j++) {
            rawAspect[i][j] = fullscreen
                .clone()
                .crop(baseX + interval * i, baseY + interval * j, 60, 60)
                .mask(mask, 0, 0)
            //.write(`[${i}][${j}].png`)

        }
    }

    while (aspectsArray.length > 0) {
        let min = 10000
        let aspectPositionX = 0
        let aspectPositionY = 0
        let name;
        let dif = 1000;

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let diff = await compareImages(rawAspect[i][j], mask, aspectsArray[0][1].name)
                    .catch(e => console.log(e))
                if (typeof diff === "number") {
                    if (diff < min) {
                        aspectPositionX = i
                        aspectPositionY = j
                        min = diff
                        name = aspectsArray[0][1].name
                        dif = diff;
                    }
                }
            }
        }
        if (dif < 500) {
            aspectPosition.set(aspectsArray[0][1].name, {x: aspectPositionX, y: aspectPositionY, name: name, diff: dif})
        }
        aspectsArray.shift()
    }
    console.log(aspectPosition);
}

async function getAllAspects() {
    let array: Array<Aspect> = [];
    aspects.forEach((item) => {
        array.push(item)
    });
    for (let i = 0; i < array.length; i++) {
        await setAspect(array[i]);
    }

    async function setAspect(item: any) {
        let image = await Jimp.read(`images/aspects/${item.name}.png`)
        aspectsFromDisk.set(item.name, image)

    }
}

async function compareImages(image: Jimp, mask: Jimp, aspectName: string) {
    let aspect = aspectsFromDisk.get(aspectName)
    //.write(`[${a},${b}].png`)
    let diff = new PNG({width: 60, height: 60})
    if (aspect !== undefined) {
        let number = pixelmatch(
            aspect.mask(mask, 0, 0).bitmap.data,
            image.mask(mask, 0, 0).bitmap.data,
            diff.data, 60, 60,
            {threshold: 0.05}) // я в душе не ебу как это работает

        if (aspectName === "terra") {
            fs.writeFileSync('diff.png', PNG.sync.write(diff));
        }
        return number
    } else return -1

}

export function readScreen() {
    screenshot({format: "png"}).then((screenshot) => {
        Jimp.read(screenshot).then(screenshot => {
            setTimeout(() => {
                checkScreen(screenshot).catch(e => console.log(e))
            }, 1000)


        })
    })
}