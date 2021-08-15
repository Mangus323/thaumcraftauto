import robot from "robotjs"
import {constants as c} from "./number_constants";

const interval = 20
let tablePosition = 0

function repeat(func: Function, count: number, params?: Array<any>): void {
    for (let i = 0; i < count; i++) {
        if (params) {
            func(...params);
        } else {
            func()
        }
    }
}

export function mouseSlide(direction: string, times?: number) {
    if (times === undefined) {
        times = 1
    }

    if (direction === "left") {
        robot.moveMouse(c.slide.left.x, c.slide.left.y)
        tablePosition -= times
    }
    if (direction === "right") {
        robot.moveMouse(c.slide.right.x, c.slide.right.y)
        tablePosition += times
    }

    if (tablePosition < 0) {
        times += tablePosition
        tablePosition = 0
    }

    repeat(robot.mouseClick, times)
}

export async function mouseToggle(x1: number, y1: number, x2: number, y2: number) {
    robot.moveMouse(x1, y1)
    await wait()
    robot.mouseToggle("down")
    robot.dragMouse(x2, y2)
    robot.mouseToggle("up")
}

async function wait() {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, interval);
    });
}