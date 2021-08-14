import Jimp from "jimp"
import scr from "screenshot-desktop"
import {aspects, generateAspects, getAspectsFromDisk, compareImages} from "./aspect_library"
import robot from "robotjs";
import {constants as c} from "./number_constants";

export let rawAspect: Array<Array<Jimp>> = [];
let aspectPosition = new Map()

async function checkScreen(screenshot: Jimp, times: number) {
    let fullscreen = screenshot.resize(1920, 1080)
    let mask = await Jimp.read("images/mask.png") // убрать числа
    await fillAspectTable(fullscreen, mask, times * 5)
}

async function fillAspectTable(fullscreen: Jimp, mask: Jimp, base: number) {
    let aspectsArray = [...aspects]

    for (let i = 0; i < 5; i++) { //создает массив внутри rawAspects и заполняет его аспектами со скриншота
        rawAspect[i + base] = [];
        for (let j = 0; j < 5; j++) {
            rawAspect[i + base][j] = fullscreen
                .clone()
                .crop(c.table.x + c.interval * i, c.table.y + c.interval * j, 60, 60)
                .mask(mask, 0, 0)
            //.write(`[${i}][${j}].png`)
        }
    }

    while (aspectsArray.length > 0) {
        if (aspectPosition.get(aspectsArray[0][1].name) !== undefined) {
            if (aspectPosition.get(aspectsArray[0][1].name).diff == 0) {
                aspectsArray.shift()
            }
        }

        let min = 1000
        let x = 0
        let y = 0
        let dif = 1000;

        for (let i = base; i < base + 5; i++) { // сравнивает объект скриншота и с диска
            for (let j = 0; j < 5; j++) {
                let diff = await compareImages(rawAspect[i][j], mask, aspectsArray[0][1].name)
                    .catch(e => console.log(e))
                if (typeof diff === "number") {
                    if (diff < min) {
                        x = i
                        y = j
                        min = diff
                        dif = diff
                    }
                }
            }
        }
        if (dif < 500) {
            aspectPosition.set(aspectsArray[0][1].name, {
                x: x, y: y, diff: dif
            })
        }
        aspectsArray.shift()
    }
    console.log(aspectPosition);
    console.log(aspectPosition.size);
}

async function indexingAspect() {
    let pos = robot.getMousePos()
    for (let i = 0; i < 2; i++) {
        let screenshot = await scr({format: "png"})
            .then((screenshot) => Jimp.read(screenshot))

        await checkScreen(screenshot, i).catch(e => console.log(e))
        robot.moveMouse(c.slide.right.x, c.slide.right.y)
        robot.mouseClick("left")
        robot.mouseClick("left")
        robot.mouseClick("left")
        robot.mouseClick("left")
        robot.mouseClick("left")
    }
    robot.moveMouse(pos.x, pos.y)
}

export function startScript() {
    generateAspects()
    robot.setMouseDelay(0);
    getAspectsFromDisk().then(() => {
        //var screenSize = robot.getScreenSize();
        //console.log(screenSize);
        indexingAspect()

    })
}
