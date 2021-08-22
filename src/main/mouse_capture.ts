import robot from "robotjs"
import {constants as c} from "./number_constants";
import {knowledgeTable, Point, researchTable} from "./screen_capture";

const interval = 60 // интервал в мс между действиями мыши
let tablePosition = 0 // позиция сдвига таблицы

export function getTablePosition(): number {
    return tablePosition
}

/**
 * Выполняет функцию func несколько раз
 * @param func Функция
 * @param count Количество выполнений
 * @param params Параметры функции
 */
function repeat(func: Function, count: number, params?: Array<any>): void {
    for (let i = 0; i < count; i++) {
        if (params) {
            func(...params);
        } else {
            func()
        }
    }
}

/**
 * Останавливает поток на interval времени
 */
async function wait() {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, interval);
    });
}

/**
 * Двигает таблицу
 * @param times Количество раз (если отрицательно, двигает в обратную сторону); если не указано, возвращает в исходную
 */
export function tableSlide(times?: number) {
    if (times === undefined) {
        times = -tablePosition
        if (tablePosition === 0) return
    }

    if (times < 0) {
        robot.moveMouse(c.slide.left.x, c.slide.left.y)
        tablePosition += times
        times = -times
    } else {
        tablePosition += times
        robot.moveMouse(c.slide.right.x, c.slide.right.y)
    }

    repeat(robot.mouseClick, times)
}

/**
 * Зажимает кнопку мыши и двигается в координаты x2;y2
 * @param x2 Конечный x
 * @param y2 Конечный y
 * @param x1 Начальный x
 * @param y1 Начальный y
 */
export async function mouseToggle(x2: number, y2: number, x1?: number, y1?: number) {
    if (x1 !== undefined && y1 !== undefined) {
        robot.moveMouse(x1, y1)
    }
    await wait()
    robot.mouseToggle("down")
    await wait()
    robot.dragMouse(x2, y2)
    await wait()
    robot.mouseToggle("up")
    await wait()
}

/**
 * Ставит аспект определенных координатах
 * @param point координата
 * @param name название аспекта
 */
export async function placeAspect(point: { x: number, y: number }, name: string): Promise<void> {
    if (name === undefined) {
        return
    }

    let pos = researchGetPosition(point)
    setPosition(name)
    await mouseToggle(pos.x, pos.y)
    researchTable[point.x][point.y].name = name

    function setPosition(aspect: string) { // наводит мышь на аспект
        let endPoint = knowledgeGetPosition(aspect)
        let pos = getTablePosition()
        tableSlide(endPoint.clicks - pos) // двигается на минимальное необходимое значение
        robot.moveMouse(endPoint.point.x, endPoint.point.y)
    }

    /**
     * Возвращает точные координаты в пикселях по точке в массиве свитка изучений
     * @param point точка
     */
    function researchGetPosition(point: Point): Point {
        if (researchTable[point.x][point.y] !== undefined) {
            if (researchTable[point.x][point.y].x !== undefined && researchTable[point.x][point.y].y !== undefined)
                return {
                    x: researchTable[point.x][point.y].x + c.research.x + 30,
                    y: researchTable[point.x][point.y].y + c.research.y + 30
                }
        }
        return {
            x: -1, y: -1
        }
    }

    /**
     *  Возвращает точные координаты изученного аспекта в пикселях и количество необходимых кликов до него
     * @param aspect аспект
     */
    function knowledgeGetPosition(aspect: string): { point: Point, clicks: number } {
        let value = {point: {x: -1, y: -1}, clicks: 0}
        let position = knowledgeTable.get(aspect)
        if (position !== undefined) {
            if (position.x < 5) {
                value.point.x = c.table.x + position.x * c.interval + 30
            } else {
                value.clicks = position.x - 4
                value.point.x = c.table.x + 4 * c.interval + 30
            }
            value.point.y = c.table.y + position.y * c.interval + 30
        }
        return value
    }
}

/**
 * Ставит цепь аспектов
 * @param way Цепь аспектов
 */
export async function placeWay(way: { path: Array<Point>, aspects: Array<string> }) {
    let path = []
    for (let i = 0; i < way.path.length; i++) {
        let point = {x: way.path[i].x, y: way.path[i].y}
        path.push({x: point.x, y: point.y, name: way.aspects[i]})
        await placeAspect(point, way.aspects[i])
    }
    return path
}
