import {researchTable} from "./screen_capture";
import {aspectsGetArray, getLinks, increaseLength} from "./aspect_library";

type AspectPosition = {
    point: Point
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

    let returnValue: Array<{ point: Point, name: string }> = []

    for (const aspectElement of aspectsGetArray()) {
        names.push(aspectElement[1].data.name)
    }
    generatePaths(paths)

    while (paths.length > 1) {
        let {way, position} = getBestWay(paths)
        returnValue.push(...way)

        paths[position.x].push(...way) // ставит цепочку и добавляет ее в массив ???
        paths[position.x].push(...paths[position.y]) // добавляет в первую цепочку вторую и убирает 2

        let path2 = [] // кастыль
        for (let i = 0; i < paths.length; i++) {
            if (i == position.y) continue
            path2.push(paths[i])
        }
        paths = path2
    }
    //tableSlide() // восстановить положение
    return returnValue

    /**
     * Возвращает лучшую цепь и соединяемые аспекты
     * @param paths Текущие цепи
     */
    function getBestWay(paths: Array<Array<AspectPosition>>) {
        let objectWay: { path: Array<Point>, aspects: Array<string> } = {path: [], aspects: []}
        let max = 100
        let position = {x: -1, y: -1}
        for (let i = 0; i < paths.length; i++) {
            for (let j = 0; j < paths.length; j++) {
                if (i == j) continue

                let res = getWay(paths[i], paths[j], max)
                if (res.way) {
                    objectWay = res.way
                    max = res.max
                    position.x = i
                    position.y = j
                    max = objectWay.path.length
                }
            }
        }

        objectWay.aspects = increaseLength(objectWay.aspects, objectWay.path.length)
        return {way: toArray(objectWay), position}

        function toArray(way: typeof objectWay): Array<{ point: Point, name: string }> {
            let returnValue = []
            for (let i = 0; i < way.path.length; i++) {
                let point = {x: way.path[i].x, y: way.path[i].y}
                returnValue.push({point: point, name: way.aspects[i]})
            }
            return returnValue
        }

        /**
         * Пытается найти самую ближайшую цепь между 2 точками
         * @param aspectPositions1 1 точка
         * @param aspectPositions2 2 точка
         * @param max Максимальная длина цепи
         * @return Путь и его длина
         */
        function getWay(aspectPositions1: Array<AspectPosition>, aspectPositions2: Array<AspectPosition>, max: number): { way: { aspects: string[], path: Point[] } | false, max: number } {
            let current: { way: { aspects: string[], path: Point[] } | false, max: number } = {way: false, max: max}
            for (let i = 0; i < aspectPositions1.length; i++) {
                for (let j = 0; j < aspectPositions2.length; j++) {
                    let pathElement1 = aspectPositions1[i]
                    let pathElement2 = aspectPositions2[j]

                    let paths = getPath(pathElement1, pathElement2)
                    if (paths.length === 0) {
                        paths = getPath(pathElement1, pathElement2, 8) // намного медленнее
                    }
                    let links = getLinks(pathElement1.name, pathElement2.name)

                    if (paths.length !== 0 && links.length !== 0) {
                        let path1 = paths[0] // 1 с четной длиной, 2 нечетной
                        let path2: Array<Point> | undefined = undefined
                        for (let k = 1; k < paths.length; k++) {
                            if (paths[k].length > path1.length
                                && paths[k].length % 2 !== path1.length % 2) {
                                path2 = paths[k]
                                break
                            }
                        }

                        let linkIndex = 0
                        for (let k = 0; k < links.length; k++) {
                            if (links[k].length === path1.length) {
                                linkIndex = k
                                break
                            }
                        }
                        current = compareWays(path1, links[linkIndex], current, [pathElement1.name, pathElement2.name])
                        current = compareWays(path2, links[linkIndex], current, [pathElement1.name, pathElement2.name])
                    }
                }
            }
            return current.way ? current : {max: max, way: false};

            /**
             * Сравнивает 2 пути
             * @param path Массив точек
             * @param link Массив аспектов
             * @param current Текущий путь
             * @param pathElements Начальный и конечный аспекты
             * @return Более оптимизированный
             */
            function compareWays(
                path: Array<Point> | undefined,
                link: Array<string>,
                current: { way: { aspects: string[], path: Point[] } | false, max: number },
                pathElements: Array<string>)
                : typeof current {
                if (path) {
                    let res = pathLinkCompare(path, link, current.max)
                    if (res) {
                        if (current.max < res.path.length) {
                            return current
                        }

                        if (res.aspects.length === 0) {
                            res.aspects = [pathElements[1], pathElements[0]]
                        }
                        if (current.way) {
                            if (res.path.length < current.way.path.length && res.aspects.length < current.way.aspects.length) {
                                current.way = res
                                current.max = res.path.length
                            }
                        } else {
                            current.way = res
                        }
                    }
                }
                return current

                /**
                 * Сравнивает путь с аспектами
                 * @param path Массив точек
                 * @param link Массив аспектов
                 * @param min Текущая минимальная длина пути
                 * @return Если подходит, то цепь, иначе false
                 */
                function pathLinkCompare(path: Array<Point>, link: Array<string>, min: number) {
                    if (path.length < min) {
                        if (link.length <= path.length && // проверка на то чтобы цепочка влезла
                            path.length % 2 === link.length % 2) { // или на то чтобы цепь можно было увеличить
                            return {
                                aspects: link,
                                path: path,
                            }
                        }
                    }
                    return false
                }
            }
        }
    }

    /**
     * Заполняет массив изначальными аспектами с экрана
     * @param array Ссылка на массив
     */
    function generatePaths(array: Array<Array<AspectPosition>>) {
        for (let i = 0; i < researchTable.length; i++) {
            for (let j = 0; j < researchTable[i].length; j++) {
                if (researchTable[i][j] !== undefined) {
                    if (names.includes(researchTable[i][j].name)) {
                        array.push([{
                            name: researchTable[i][j].name, point: {x: i, y: j}
                        }])
                    }
                }
            }
        }
    }

    /**
     * Соединяет точки 2 аспектов
     * @param aspect1 1 аспект
     * @param aspect2 2 аспект
     * @param max максимальная длина пути
     * @return Массив всех возможных путей соединения точек
     */
    function getPath(aspect1: AspectPosition, aspect2: AspectPosition, max: number = 5): Array<Array<Point>> {
        let ways: Array<Array<Point>> = []
        way(aspect1.point, aspect2.point, ways)
        ways.sort((a, b) => { // сортировка по возрастанию количества
            return a.length - b.length
        })
        return ways

        /**
         * Заполняет ways возможными путями
         * @param point1 1 точка
         * @param point2 2 точка
         * @param ways Ссылка на двумерный массив точек
         * @param path Изначальный массив
         * @return Внутренняя переменная для выхода из рекурсии
         */
        function way(point1: Point, point2: Point, ways: Array<Array<Point>>, path: Array<Point> = []): boolean {
            for (const stepPoint of getStepPoints(point1.x)) {
                if (point1.x + stepPoint.x === point2.x && point1.y + stepPoint.y === point2.y) {
                    ways.push(path)
                }
            }

            for (const step of getSteps(point1)) {
                let point = {x: point1.x + step.x, y: point1.y + step.y}

                if (path.length > max) {
                    return false
                }

                let skip = false
                for (let i = 0; i < path.length; i++) { // проверка на ход назад
                    if (path[i].x === point.x && path[i].y === point.y) {
                        skip = true
                        break
                    }
                }
                if (skip) continue

                if (way(point, point2, ways, [...path, point])) {
                    return true // для выхода из рекурсии
                }
            }
            return false
        }
    }
}

/**
 * Возвращает возможные шаги для движения в столе изучения
 * @param point Исходная точка
 * @return Массив шагов
 */
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

/**
 * Возвращает все шаги движения
 * @param x x координата точки
 * @return Массив шагов
 */
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
