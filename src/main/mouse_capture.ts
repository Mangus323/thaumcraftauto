import robot from "robotjs"
import {constants as c} from "./number_constants";

const interval = 60
let tablePosition = 0

export function getSlidePosition(): number {
    return tablePosition
}

function repeat(func: Function, count: number, params?: Array<any>): void {
    for (let i = 0; i < count; i++) {
        if (params) {
            func(...params);
        } else {
            func()
        }
    }
}

export function mouseSlide(times?: number) {
    if (times === undefined) {
        times = 1
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

async function wait() {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, interval);
    });
}