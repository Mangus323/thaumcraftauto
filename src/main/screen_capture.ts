import Jimp from "jimp"
import scr from "screenshot-desktop"
import {aspects, compareWithAspect, compareImages} from "./aspect_library"
import robot from "robotjs";
import {constants as c} from "./number_constants";
import {mouseSlide} from "./mouse_capture";

let knowledgeAspects: Array<Array<Jimp>> = [];
let researchTableAspect: Array<Array<{ image: Jimp, x?: number, y?: number, name?: string }>> = [];

let knowledgeAspectsArray: Map<string, any> = new Map()

export function knowledgeGetPosition(aspect: string): { x: number, y: number } {
    let position = {x: -1, y: -1}
    let aspectArray = knowledgeAspectsArray.get(aspect)
    position.x = c.table.x + aspectArray.x * c.interval + 20
    position.y = c.table.y + aspectArray.y * c.interval + 20
    return position
}

export function researchGetPosition(x: number, y: number) {
    return {
        x: researchTableAspect[x][y].x,
        y: researchTableAspect[x][y].y
    }
}


async function checkScreen(screenshot: Jimp, count: number) {
    let fullscreen = screenshot.resize(1920, 1080)
    let mask = await Jimp.read("images/mask.png") // убрать числа
    await fillKnowledgeAspects(fullscreen, mask, count * 5)
}

export async function fillResearchArray() {
    let screenshot = await scr({format: "png"})
    let research = (await Jimp.read(screenshot))
        .crop(c.research.x, c.research.y, c.research.w, c.research.h)

    let masks: Array<Jimp> = [];
    masks[0] = await Jimp.read("images/research_mask.png")
    masks[1] = await Jimp.read("images/mask.png")
    let emptyAspect = await Jimp.read("images/empty_aspect.png")

    let aspectsArray = [...aspects]
    firstPart() // нечетные столбцы
    secondPart() // четные
    fill()

    function firstPart() {
        for (let i = 0; i < 5; i++) {
            researchTableAspect[i * 2] = [];
            let offset = 0 // смещение сетки при высоком разрешении
            for (let j = 0; j < 9; j++) {
                switch (j) {
                    case 3:
                        offset = 1
                        break;
                    case 6:
                        offset = 2
                        break;
                    default:
                        break;
                }
                let x = c.aspect.size * i + c.research.horizontal_interval * i
                let y = c.aspect.size * j + j * 2 + offset
                researchTableAspect[i * 2][j] = {
                    x, y,
                    image: research
                        .clone()
                        .crop(x, y, c.aspect.size, c.aspect.size)
                        .mask(masks[0], 0, 0)
                        .mask(masks[1], 0, 0)
                }


                // .write(`test/[${i * 2}][${j}].png`)
            }
        }
    }

    function secondPart() {
        for (let i = 0; i < 4; i++) {
            researchTableAspect[i * 2 + 1] = [];
            let offset = 0 // смещение сетки при высоком разрешении
            for (let j = 0; j < 8; j++) {
                switch (j) {
                    case 0:
                        offset = 1
                        break
                    case 3:
                        offset = 2
                        break
                    case 5:
                        offset = 3
                        break
                    default:
                        break
                }

                let x = c.research.offset.x + c.aspect.size * i + c.research.horizontal_interval * i
                let y = c.research.offset.y + c.aspect.size * j + j * 2 + offset

                researchTableAspect[i * 2 + 1][j] = {
                    x, y,
                    image: research
                        .clone()
                        .crop(x, y, c.aspect.size, c.aspect.size)
                        .mask(masks[0], 0, 0)
                        .mask(masks[1], 0, 0)
                }
                //  .write(`test/[${i * 2 + 1}][${j}].png`)
            }
        }
    }

    function fill() {
        for (let i = 0; i < 9; i++) { // сравнивает объект скриншота и с диска
            for (let j = 0; j < 9; j++) {
                if (i % 2 == 1 && j == 8) { // пропуск пустых ячеек
                    continue
                }

                if (compareImages([researchTableAspect[i][j].image, emptyAspect]) == 0) { // заполнение массива клетками без аспектов
                    researchTableAspect[i][j].name = "empty"
                    continue
                }

                let min = 400
                let name = ""

                for (let k = 0; k < aspectsArray.length; k++) {
                    let diff = compareWithAspect(researchTableAspect[i][j].image, aspectsArray[k][1].name, masks)
                    if (diff < min) {
                        min = diff
                        name = aspectsArray[k][1].name
                    }
                }
                if (min < 400) {
                    researchTableAspect[i][j].name = `${name}`
                }
            }
        }
    }
}

async function fillKnowledgeAspects(fullscreen: Jimp, mask: Jimp, base: number) {
    let aspectsArray = [...aspects]

    for (let i = 0; i < 5; i++) { //создает массив внутри knowledgeAspects и заполняет его аспектами со скриншота
        knowledgeAspects[i + base] = [];
        for (let j = 0; j < 5; j++) {
            knowledgeAspects[i + base][j] = fullscreen
                .clone()
                .crop(c.table.x + c.interval * i, c.table.y + c.interval * j, 60, 60)
                .mask(mask, 0, 0)
            //.write(`[${i}][${j}].png`)
        }
    }

    while (aspectsArray.length > 0) {
        if (knowledgeAspectsArray.get(aspectsArray[0][1].name) !== undefined) {
            if (knowledgeAspectsArray.get(aspectsArray[0][1].name).diff == 0) {
                aspectsArray.shift()
            }
        }

        let min = 5000
        let x = 0
        let y = 0

        for (let i = base; i < base + 5; i++) { // сравнивает объекты скриншота и с диска
            for (let j = 0; j < 5; j++) {
                let diff = compareWithAspect(knowledgeAspects[i][j], aspectsArray[0][1].name, [mask])
                if (diff < min) {
                    x = i
                    y = j
                    min = diff
                }
            }
        }
        if (min < 500) {
            knowledgeAspectsArray.set(aspectsArray[0][1].name, {
                x: x, y: y, diff: min
            })
        }
        aspectsArray.shift()
    }
}

export async function indexingAspect() {
    let pos = robot.getMousePos()
    for (let i = 0; i < 2; i++) {
        let screenshot = await scr({format: "png"})
            .then((screenshot) => Jimp.read(screenshot))

        await checkScreen(screenshot, i)
        mouseSlide("right", 5)
    }
    mouseSlide("left", 5)

    robot.moveMouse(pos.x, pos.y)

    log()
}

function log() {
    console.log(knowledgeAspectsArray);
    console.log(knowledgeAspectsArray.size);

    for (let i = 0; i < researchTableAspect.length; i++) {
        for (let j = 0; j < researchTableAspect[i].length; j++) {
            console.log(`${i} ${j} ${researchTableAspect[i][j].name}`)
        }
    }
}

