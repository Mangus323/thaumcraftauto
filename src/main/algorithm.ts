import {researchTable, placeWay} from "./screen_capture";
import {aspectsGetArray, getLinks, increaseLength} from "./aspect_library";

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
    //let endPoints = getEndPoints()
    //await pathsToCenter()

    while (paths.length > 1) {
        let min = 100
        let position = {x: -1, y: -1}
        let way: { path: Array<Point>, aspects: Array<string> } = {path: [], aspects: []}

        for (let i = 0; i < paths.length; i++) {
            for (let j = 0; j < i; j++) {
                let res = getWay(paths[i], paths[j], min)
                if (res) {
                    way = res
                    position.x = i
                    position.y = j
                    min = way.path.length
                    break
                }
                if (position.x !== -1) break
            }
        }

        way.aspects = increaseLength(way.aspects, way.path.length)

        paths[position.x].push(...(await placeWay(way))) // ставит цепочку и добавляет ее в массив
        paths[position.x].push(...paths[position.y]) // добавляет в первую цепочку вторую и убирает 2
        let path2 = []
        for (let i = 0; i < paths.length; i++) {
            if (i == position.y) continue
            path2.push(paths[i])
        }
        paths = path2
    }

    function getWay(aspectPositions1: Array<AspectPosition>, aspectPositions2: Array<AspectPosition>, min: number) {
        let returnItem: false | { aspects: string[], path: Point[] } = false
        for (let i = 0; i < aspectPositions1.length; i++) {
            for (let j = 0; j < aspectPositions2.length; j++) {
                let pathElement1 = aspectPositions1[i]
                let pathElement2 = aspectPositions2[j]


                let ways = getPath(pathElement1, pathElement2)
                let links = getLinks(pathElement1.name, pathElement2.name)
                if (ways.length !== 0 && links.length !== 0) {
                    let way1 = ways[0] // 1 с четной длиной, 2 нечетной
                    let way2: Array<Point> | undefined = undefined
                    for (let k = 1; k < ways.length; k++) {
                        if (ways[k].length > way1.length
                            && ways[k].length % 2 !== way1.length % 2) {
                            way2 = ways[k]
                        }
                    }
                    let linkIndex = 0
                    for (let k = 0; k < links.length; k++) {
                        if (links[k].length === way1.length) {
                            linkIndex = k
                            break
                        }
                    }
                    returnItem = setWay(way1, links[linkIndex], returnItem, [pathElement2.name, pathElement1.name], min)
                    returnItem = setWay(way2, links[linkIndex], returnItem, [pathElement2.name, pathElement1.name], min)
                }
            }
        }
        return returnItem ? returnItem : false;

        function setWay(path: Array<Point> | undefined, link: Array<string>, returnItem: false | { aspects: string[], path: Point[] }, pathElements: Array<string>, min: number) {
            if (path) {
                let res = wayLinkCompare(path, link, min)
                if (res) {
                    if (min < res.path.length) {
                        return returnItem
                    }

                    if (res.aspects.length === 0) {
                        res.aspects = [pathElements[1], pathElements[0]]
                    }
                    if (returnItem) {
                        if (res.path.length < returnItem.path.length && res.aspects.length < returnItem.aspects.length) {
                            returnItem = res
                        }
                    } else {
                        returnItem = res
                    }
                }
            }
            return returnItem

            function wayLinkCompare(way: Array<Point>, link: Array<string>, min: number) {
                if (way.length < min) {
                    if (link.length <= way.length && // проверка на то чтобы цепочка влезла
                        way.length % 2 === link.length % 2) { // или на то чтобы цепь можно было увеличить
                        return {
                            aspects: link,
                            path: way,
                        }
                    }
                }
                return false
            }
        }
    }

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

// async function pathsToCenter() {
//     for (const path of paths) {
//         await moveToCenter(path)
//     }
//
//     async function moveToCenter(path: any): Promise<boolean> {
//         let nextAspect = await toCenter(path[path.length - 1])
//         let stop = false
//         endPoints.forEach((point) => {
//             if (nextAspect.x === point.x && nextAspect.y === point.y) {
//                 path.push(nextAspect)
//                 stop = true
//                 return
//             }
//         })
//         if (!stop) {
//             path.push(nextAspect)
//             if (await moveToCenter(path))
//                 return true
//         }
//         return false
//     }
// }

    function getPath(aspect1: AspectPosition, aspect2: AspectPosition): Array<Array<Point>> {
        let ways: Array<Array<Point>> = []
        way(aspect1, aspect2, [])
        ways.sort((a, b) => { // сортировка по возрастанию количества
            return a.length - b.length
        })

        return ways

        function way(point1: Point, point2: Point, path: Array<Point>): boolean {
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

// async function toCenter(tableAspect: AspectPosition): Promise<AspectPosition> {
//     let steps = getSteps(tableAspect)
//     let step = getStep() // шаг к центру
//
//     let aspectPosition: AspectPosition = {
//         x: tableAspect.x + step.x,
//         y: tableAspect.y + step.y,
//         name: getNextAspect(tableAspect.name)
//     }
//
//     await placeAspect({x: aspectPosition.x, y: aspectPosition.y}, aspectPosition.name)
//     return aspectPosition
//
//     function getStep(): Point {
//         let difference: Array<number> = []
//         steps.forEach((item) => {
//             let x = tableAspect.x + item.x - 4
//             if (x < 0) x = -x
//             let y = tableAspect.y + item.y - 4
//             if (y < 0) y = -y
//             difference.push(x + y)
//         })
//
//         return steps[difference.indexOf(Math.min(...difference))]
//     }
//
//     function getNextAspect(name: string): string {
//         let aspect = getAspect(name)
//         if (aspect.name !== "err") {
//             let harder = toHarder(aspect.name)
//             if (harder) {
//                 return harder
//             }
//             if (aspect.contains) {
//                 if (aspect.contains[0])
//                     return aspect.contains[0].name
//             }
//         }
//         return ""
//     }
// }

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

// function getEndPoints(): Array<Point> {
//     return [
//         new Point(2, 3), // left
//         new Point(2, 4),
//         new Point(2, 5),
//
//         new Point(6, 3), // right
//         new Point(6, 4),
//         new Point(6, 5),
//
//         new Point(3, 2), // up
//         new Point(4, 2),
//         new Point(5, 2),
//
//         new Point(3, 5), // down
//         new Point(4, 6),
//         new Point(5, 5),
//     ]
// }