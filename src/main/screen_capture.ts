import Jimp from "jimp"
import scr from "screenshot-desktop"
import {constants as c} from "../number_constants";
import {tableSlide} from "./mouse_capture";
import {aspectsGetArray} from "./aspect_library";
import {compareImages, compareWithAspect} from "./image";
import {setPreview} from "./preview";


export type Point = {
    x: number
    y: number
}

let knowledgeAspects: Array<Array<Jimp>> = [] // картинки со скриншота
export let knowledgeTable: Map<string, Point & { diff: number }> = new Map() // коллекция значений
export let researchTable: Array<Array<{ image: Jimp, x: number, y: number, name: string }>> = [];


/**
 * Заполняет массив свитка изучений
 */
export async function fillResearchTable() {
    researchTable = [] // очистить перед повторным использованием
    let screenshot = await scr({format: "png"})
    let research = (await Jimp.read(screenshot))
        .crop(c.research.x, c.research.y, c.research.w, c.research.h)

    setPreview(await research.clone())

    let masks: Array<Jimp> = [];
    masks[0] = await Jimp.read("images/research_mask.png")
    masks[1] = await Jimp.read("images/mask.png")
    let emptyAspect = await Jimp.read("images/empty_aspect.png")

    let aspectsArray = aspectsGetArray()
    notEven() // нечетные столбцы
    even() // четные
    fill()

    function notEven() {
        for (let i = 0; i < 5; i++) {
            researchTable[i * 2] = [];
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
                researchTable[i * 2][j] = {
                    x, y, name: "",
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

    function even() {
        for (let i = 0; i < 4; i++) {
            researchTable[i * 2 + 1] = [];
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

                researchTable[i * 2 + 1][j] = {
                    x, y, name: "",
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

                if (compareImages([researchTable[i][j].image, emptyAspect]) < 100) { // заполнение массива клетками без аспектов
                    researchTable[i][j].name = "empty"
                    continue
                }

                let min = 400
                let name = ""

                for (let k = 0; k < aspectsArray.length; k++) {
                    let diff = compareWithAspect(researchTable[i][j].image, aspectsArray[k][1].data.name, masks)
                    if (diff < min) {
                        min = diff
                        name = aspectsArray[k][1].data.name
                    }
                }
                if (min < 400) {
                    researchTable[i][j].name = `${name}`
                }
            }
        }
    }
}

/**
 * Заполняет массив изученных аспектов
 */
export async function fillKnowledgeTable() {
    let mask = await Jimp.read("images/mask.png") // убрать числа
    for (let i = 0; i < 2; i++) {
        let screenshot = await scr({format: "png"})
            .then((screenshot) => Jimp.read(screenshot))

        await checkScreen(screenshot, mask, i)
        if (knowledgeTable.size < 5) { // чтобы не двигалась мышь при ненайденном окне
            return
        }
        tableSlide(5)
    }
    tableSlide(-10)

    /**
     * Сканирует скриншот
     * @param screenshot скриншот экрана
     * @param iteration итерация
     * @param mask маска аспектов
     */
    async function checkScreen(screenshot: Jimp, mask: Jimp, iteration: number) {
        let fullscreen = screenshot.resize(1920, 1080)
        await fillKnowledgeAspects(fullscreen, mask, iteration * 5)
    }

    /**
     * Заполняет массив аспектами
     * @param screenshot скриншот экрана
     * @param mask маска аспектов
     * @param base начальный столбец заполнения в массив
     */
    async function fillKnowledgeAspects(screenshot: Jimp, mask: Jimp, base: number) {
        for (let i = 0; i < 5; i++) { //создает массив внутри knowledgeAspects и заполняет его аспектами со скриншота
            knowledgeAspects[i + base] = [];
            for (let j = 0; j < 5; j++) {
                knowledgeAspects[i + base][j] = screenshot
                    .clone()
                    .crop(c.knowledge.x + c.interval * i, c.knowledge.y + c.interval * j, 60, 60)
                    .mask(mask, 0, 0)
                //.write(`[${i}][${j}].png`)
            }
        }

        let aspectsArray = aspectsGetArray()

        while (aspectsArray.length > 0) { // пока не просканирует всех аспекты из списка
            if (knowledgeTable.get(aspectsArray[0][1].data.name) !== undefined) { // проверка на найденный аспект
                let aspect = knowledgeTable.get(aspectsArray[0][1].data.name)
                if (aspect !== undefined)
                    if (aspect.diff === 0) {
                        aspectsArray.shift()
                    }
            }

            let min = 5000
            let x = 0
            let y = 0

            for (let i = base; i < base + 5; i++) { // сравнивает объекты скриншота и с диска
                for (let j = 0; j < 5; j++) {
                    let diff = compareWithAspect(knowledgeAspects[i][j], aspectsArray[0][1].data.name, [mask])
                    if (diff < min) {
                        x = i
                        y = j
                        min = diff
                    }
                }
            }
            if (min < 500) {
                knowledgeTable.set(aspectsArray[0][1].data.name, {
                    x: x, y: y, diff: min
                })
            }
            aspectsArray.shift()
        }
    }
}

/**
 * Возвращает точные координаты в пикселях по точке в массиве свитка изучений
 * @param point точка
 */
export function researchGetPosition(point: Point): Point {
    if (researchTable[point.x][point.y] !== undefined) {
        if (researchTable[point.x][point.y].x !== undefined && researchTable[point.x][point.y].y !== undefined)
            return {
                x: researchTable[point.x][point.y].x + c.research.x,
                y: researchTable[point.x][point.y].y + c.research.y
            }
    }
    return {
        x: -1, y: -1
    }
}


