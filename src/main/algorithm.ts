import {researchTable, placeAspect} from "./screen_capture";
import {aspectsGetArray, getAspect, toHarder} from "./aspect_library";

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
    let paths: Array<Array<AspectPosition>> = []

    for (const aspectElement of aspectsGetArray()) {
        names.push(aspectElement[1].data.name)
    }
    generatePaths(paths)
    let endPoints = getEndPoints()
    //await pathsToCenter()



    getWays(paths[0][0], paths[1][0])

    function generatePaths(array: Array<Array<AspectPosition>>) {
        for (let i = 0; i < researchTable.length; i++) {
            for (let j = 0; j < researchTable[i].length; j++) {
                if (researchTable[i][j] !== undefined) {
                    if (names.includes(researchTable[i][j].name)) {
                        array.push([{
                            name: researchTable[i][j].name, x: i, y: j
                        }])
                    }
                }
            }
        }
    }

    async function pathsToCenter() {
        for (const path of paths) {
            await moveToCenter(path)
        }

        async function moveToCenter(path: any): Promise<boolean> {
            let nextAspect = await toCenter(path[path.length - 1])
            let stop = false
            endPoints.forEach((point) => {
                if (nextAspect.x === point.x && nextAspect.y === point.y) {
                    path.push(nextAspect)
                    stop = true
                    return
                }
            })
            if (!stop) {
                path.push(nextAspect)
                if (await moveToCenter(path))
                    return true
            }
            return false
        }
    }

    function getWays(aspect1: AspectPosition, aspect2: AspectPosition) {
        let ways: Array<Array<Point>> = []
        way(aspect1, aspect2, [])
        ways.sort((a, b) => { // сортировка по возрастанию количества
            return a.length - b.length
        })

        function way(point1: Point, point2: Point, path: Array<Point>): boolean {
            //console.log(path[path.length - 1])
            //console.log(path.length)

            for (const stepPoint of getStepPoints(point1.x)) {
                if (point1.x + stepPoint.x === point2.x && point1.y + stepPoint.y === point2.y) {
                    ways.push(path)
                }
            }

            for (const step of getSteps(point1)) {
                let point = {x: point1.x + step.x, y: point1.y + step.y}

                if (path.length > 5) {
                    return false
                }

                let skip = false
                for (let i = 0; i < path.length; i++) { // проверка на ход назад
                    if (path[i].x === point.x && path[i].y === point.y) {
                        skip = true
                    }
                }
                if (skip) continue

                if (way(point, point2, [...path, point])) {
                    return true
                }
            }
            return false
        }
    }
}

async function toCenter(tableAspect: AspectPosition): Promise<AspectPosition> {
    let steps = getSteps(tableAspect)
    let step = getStep() // шаг к центру

    let aspectPosition: AspectPosition = {
        x: tableAspect.x + step.x,
        y: tableAspect.y + step.y,
        name: getNextAspect(tableAspect.name)
    }

    await placeAspect({x: aspectPosition.x, y: aspectPosition.y}, aspectPosition.name)
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

function getSteps(point: Point): Array<Point> {
    let steps: Array<Point> = []
    getStepPoints(point.x).forEach((item) => {
        if (researchTable[point.x + item.x]) {
            if (researchTable[point.x + item.x][point.y + item.y]) {
                if (researchTable[point.x + item.x][point.y + item.y].name === "empty") {
                    steps.push(item)
                }
            }
        }
    })
    return steps
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
        new Point(5, 5),
    ]
}