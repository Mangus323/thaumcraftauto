import Jimp from "jimp"
import scr from "screenshot-desktop"
import {aspects, generateAspects, getAspectsFromDisk, compareWithAspect, compareImages} from "./aspect_library"
import robot from "robotjs";
import {constants as c} from "./number_constants";

let rawAspect: Array<Array<Jimp>> = [];
let researchTableAspect: Array<Array<Jimp>> = [];

let researchTablePosition: Array<Array<Object>> = []
let aspectPosition = new Map()

function repeat(func: Function, count: number, params?: Array<any>): void {
    for (let i = 0; i < count; i++) {
        if (params) {
            func(...params);
        } else {
            func()
        }
    }
}

async function checkScreen(screenshot: Jimp, count: number) {
    let fullscreen = screenshot.resize(1920, 1080)
    let mask = await Jimp.read("images/mask.png") // убрать числа
    await fillAspectTable(fullscreen, mask, count * 5)
}

async function fillResearchArray() {
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

    // for (let i = 0; i < researchTablePosition.length; i++) {
    //     for (let j = 0; j < researchTablePosition[i].length; j++) {
    //         console.log(`${i} ${j} ${researchTablePosition[i][j]}`)
    //     }
    // }


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
                researchTableAspect[i * 2][j] = research
                    .clone()
                    .crop(c.aspect.size * i + c.research.horizontal_interval * i,
                        c.aspect.size * j + j * 2 + offset,
                        c.aspect.size, c.aspect.size)
                    .mask(masks[0], 0, 0)
                    .mask(masks[1], 0, 0)
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
                researchTableAspect[i * 2 + 1][j] = research
                    .clone()
                    .crop(c.research.offset.x + c.aspect.size * i + c.research.horizontal_interval * i,
                        c.research.offset.y + c.aspect.size * j + j * 2 + offset,
                        c.aspect.size, c.aspect.size)
                    .mask(masks[0], 0, 0)
                    .mask(masks[1], 0, 0)
                //  .write(`test/[${i * 2 + 1}][${j}].png`)
            }
        }
    }

    function fill() {
        for (let i = 0; i < 9; i++) { // сравнивает объект скриншота и с диска
            researchTablePosition[i] = []
            for (let j = 0; j < 9; j++) {
                if (i % 2 == 1 && j == 8) { // пропуск пустых ячеек
                    continue
                }

                if (compareImages([researchTableAspect[i][j], emptyAspect]) == 0) { // заполнение массива клетками без аспектов
                    researchTablePosition[i][j] = "empty"
                    continue
                }

                let min = 400
                let name = ""

                for (let k = 0; k < aspectsArray.length; k++) {
                    let diff = compareWithAspect(researchTableAspect[i][j], aspectsArray[k][1].name, masks)
                    if (diff < min) {
                        min = diff
                        name = aspectsArray[k][1].name
                    }
                }
                if (min < 400) {
                    researchTablePosition[i][j] = `${name}+${min}`
                }
            }
        }
    }
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

        let min = 5000
        let x = 0
        let y = 0

        for (let i = base; i < base + 5; i++) { // сравнивает объекты скриншота и с диска
            for (let j = 0; j < 5; j++) {
                let diff = compareWithAspect(rawAspect[i][j], aspectsArray[0][1].name, [mask])
                if (diff < min) {
                    x = i
                    y = j
                    min = diff
                }
            }
        }
        if (min < 500) {
            aspectPosition.set(aspectsArray[0][1].name, {
                x: x, y: y, diff: min
            })
        }
        aspectsArray.shift()
    }
}

async function indexingAspect() {
    let pos = robot.getMousePos()
    for (let i = 0; i < 2; i++) {
        let screenshot = await scr({format: "png"})
            .then((screenshot) => Jimp.read(screenshot))

        await checkScreen(screenshot, i).catch(e => console.log(e))
        robot.moveMouse(c.slide.right.x, c.slide.right.y)
        repeat(robot.mouseClick, 5)
    }
    robot.moveMouse(c.slide.left.x, c.slide.left.y)
    repeat(robot.mouseClick, 5)

    robot.moveMouse(pos.x, pos.y)

    console.log(aspectPosition);
    console.log(aspectPosition.size);
}

export async function startScript() {
    generateAspects()
    robot.setMouseDelay(0);


    // setTimeout(async () => {
    //     robot.moveMouse(c.table.x + 10, c.table.y + 10)
    //
    //     await setTimeout(() => {
    //         robot.mouseToggle("down")
    //
    //
    //         setTimeout(() => {
    //             robot.dragMouse(960, 260)
    //             robot.mouseToggle("up")
    //         }, 20)
    //     }, 20)
    //
    //
    // }, 2000)

    getAspectsFromDisk().then(async () => {
        await fillResearchArray()
        //var screenSize = robot.getScreenSize();
        //console.log(screenSize);
        // await indexingAspect()
    })

}
