import {researchTableAspect, placeAspect} from "./screen_capture";
import {aspects, getAspect, toHarder} from "./aspect_library";

type AspectPosition = {
    x: number,
    y: number,
    name: string
}

class Point {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export async function alg() {
    let names: Array<string> = []
    let tableAspects: Array<AspectPosition> = []

    for (const aspectElement of aspects) {
        names.push(aspectElement[1].name)
    }

    let endPoints = getEndPoints()
    await fill()

    for (let i = 0; i < 10 || tableAspects.length !== 0; i++) {
        await iteration();
    }

    function fill() {
        for (let i = 0; i < researchTableAspect.length; i++) {
            for (let j = 0; j < researchTableAspect[i].length; j++) {
                if (researchTableAspect[i][j] !== undefined) {
                    if (names.includes(researchTableAspect[i][j].name)) {
                        tableAspects.push({
                            name: researchTableAspect[i][j].name, x: i, y: j
                        })
                    }
                }
            }
        }
    }

    async function iteration() {
        let nextAspects: Array<AspectPosition> = []
        for (const tableAspect of tableAspects) {
            let nextAspect = await setAspect(tableAspect)
            let stop = false
            endPoints.forEach((point) => {
                if (nextAspect.x === point.x && nextAspect.y === point.y) {
                    stop = true
                }
            })
            if (!stop) nextAspects.push(nextAspect)

        }
        tableAspects = nextAspects
    }
}

async function setAspect(tableAspect: AspectPosition): Promise<AspectPosition> {
    let steps: Array<Point> = []

    getStepPoints(tableAspect.x).forEach((item) => {
        if (researchTableAspect[tableAspect.x + item.x]) {
            if (researchTableAspect[tableAspect.x + item.x][tableAspect.y + item.y]) {
                if (researchTableAspect[tableAspect.x + item.x][tableAspect.y + item.y].name === "empty") {
                    steps.push(item)
                }
            }
        }
    })
    let step = getStep() // шаг к центру

    let aspectPosition: AspectPosition = {
        x: tableAspect.x + step.x,
        y: tableAspect.y + step.y,
        name: getNextAspect(tableAspect.name)
    }

    await placeAspect(aspectPosition)
    return aspectPosition

    function getStep(): Point {
        let difference: Array<number> = []
        steps.forEach((item) => {
            let x = tableAspect.x + item.x - 4
            if (x < 0) x = -x
            let y = tableAspect.y + item.y - 4
            if (y < 0) y = -y
            difference.push(x + y)
        })

        return steps[difference.indexOf(Math.min(...difference))]
    }

    function getNextAspect(name: string): string {
        let aspect = getAspect(name)
        if (aspect.name !== "err") {
            let harder = toHarder(aspect.name)
            if (harder) {
                return harder
            }
            if (aspect.contains) {
                if (aspect.contains[0])
                    return aspect.contains[0].name
            }
        }
        return ""
    }
}

function getStepPoints(x: number): Array<Point> {
    let points = [
        new Point(-1, 0),
        new Point(1, 0),
        new Point(0, -1),
        new Point(0, 1),
    ]
    if (x % 2 === 0) { // четные вверх
        points.unshift(
            new Point(1, -1),
            new Point(-1, -1)
        )
    } else { // нечетные вниз
        points.unshift(
            new Point(1, 1),
            new Point(-1, 1)
        )
    }
    return points
}

function getEndPoints(): Array<Point> {
    return [
        new Point(2, 3), // left
        new Point(2, 4),
        new Point(2, 5),

        new Point(6, 3), // right
        new Point(6, 4),
        new Point(6, 5),

        new Point(3, 2), // up
        new Point(4, 2),
        new Point(5, 2),

        new Point(3, 5), // down
        new Point(4, 6),
        new Point(3, 7),
    ]
}