import {researchTableAspect, placeAspect} from "./screen_capture";
import {aspects, toHarder} from "./aspect_library";

type AspectPosition = {
    x: number,
    y: number,
    name: string
}

export async function alg() {
    let names: Array<string> = []
    let tableAspects: Array<AspectPosition> = []

    for (const aspectElement of aspects) {
        names.push(aspectElement[1].name)
    }
    await iteration(true);
    await iteration(false);
    await iteration(false);


    async function iteration(first: boolean) {
        if (first) {
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
        } else {

        }
        let nextAspects: Array<AspectPosition> = []
        for (const tableAspect of tableAspects) {
            nextAspects.push(await setAspect(tableAspect))
        }
        tableAspects = nextAspects
    }
}

async function setAspect(tableAspect: AspectPosition): Promise<AspectPosition> {
    let steps: Array<{ x: number, y: number }> = []
    getPoints(tableAspect.x).forEach((item) => {
        if (researchTableAspect[tableAspect.x + item.x]) {
            if (researchTableAspect[tableAspect.x + item.x][tableAspect.y + item.y]) {
                if (researchTableAspect[tableAspect.x + item.x][tableAspect.y + item.y].name === "empty") {
                    steps.push(item)
                }
            }
        }
    })
    let difference: Array<number> = []
    steps.forEach((item) => {
        let x = tableAspect.x + item.x - 4
        if (x < 0) x = -x
        let y = tableAspect.y + item.y - 4
        if (y < 0) y = -y
        difference.push(x + y)
    })

    let step = steps[difference.indexOf(Math.min(...difference))]
    let aspect = aspects.get(tableAspect.name)
    let aspectPosition: AspectPosition = {x: tableAspect.x + step.x, y: tableAspect.y + step.y, name: ""}

    if (aspect !== undefined) {
        // @ts-ignore
        let name = toHarder(aspect.name) || aspect.contains[0].name
        aspectPosition.name = name
        await placeAspect({x: tableAspect.x + step.x, y: tableAspect.y + step.y, name})
    }
    return aspectPosition

}

function Point(x: number, y: number) {
    return {x, y}
}

function getPoints(x: number) {
    let steps = [
        Point(-1, 0),
        Point(1, 0),
        Point(0, -1),
        Point(0, 1),
    ]
    if (x % 2 === 0) { // четные вверх
        steps.unshift(
            Point(1, -1),
            Point(-1, -1)
        )
    } else { // нечетные вниз
        steps.unshift(
            Point(1, 1),
            Point(-1, 1)
        )
    }
    return steps
}