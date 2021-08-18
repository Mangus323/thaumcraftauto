import Jimp from "jimp";

export class Aspect {
    constructor(name: string, contains?: Array<Aspect>) {
        this.name = name
        if (contains === undefined) {
            this.base = true
            this.contains = null
        } else {
            this.base = false

            this.contains = contains
        }
    }

    name: string
    contains: Array<Aspect> | null
    base: boolean
    contain = (aspect: string) => {
        if (this.contains !== null) {
            return aspect === this.contains[0].name || aspect === this.contains[1].name
        }
        return false
    }
}

const aspects: Map<string, { data: Aspect, image?: Jimp }> = new Map();

/**
 * Возвращает массив всех аспектов в коллекции
 * @return массив аспектов
 */
export function aspectsGetArray() {
    return [...aspects]
}

/**
 * Возвращает объект класса Aspect строки
 * @param name аспект
 */
export function getAspect(name: string): Aspect {
    let aspect = aspects.get(name)
    if (aspect) {
        return aspect.data
    } else {
        return new Aspect("err")
    }
}
/**
 * Возвращает Jimp объект аспекта
 * @param name аспект
 */
export function getAspectImage(name: string): Jimp | undefined {
    let aspect = aspects.get(name)
    if (aspect)
        if (aspect.image)
            return aspect.image
    return undefined
}

/**
 * Возвращает массив путей соединения 2 аспектов
 *
 * @param aspect1 1 аспект
 * @param aspect2 2 аспект
 * @return массив путей соединения аспектов
 */
export function getLinks(aspect1: string, aspect2: string): string[][] {
    let various: Array<Array<string>> = []
    getPath(derivative(aspect1), aspect1, aspect2)
    if (various.length === 0) {
        getPath(derivative(aspect2), aspect2, aspect1)
        for (let i = 0; i < various.length; i++) { // сделать обратный порядок следования
            various[i] = various[i].reverse()
        }
    }

    various.sort((a, b) => { // сортировка по возрастанию количества
        return a.length - b.length
    })
    return various

    function getPath(aspects: Array<string>, from: string, to: string, path: Array<string> = [], done: boolean = false): { done: boolean, path: Array<string> } {
        for (let i = 0; i < aspects.length; i++) {
            if (aspects[i] === to) {
                various.push(path)
                return {path, done: true}
            } else {
                let next = derivative(aspects[i])
                let res = (getPath((next), from, to, [...path, aspects[i]], done))
                path.push(...res.path)
                if (res.done) {
                    return {path, done}
                }
            }
        }
        return {path: [], done: false}
    }

    function derivative(aspect: string): Array<string> {
        let derivatives: Array<string> = []
        aspects.forEach((item) => {
            if (item.data.contain(aspect)) {
                derivatives.push(item.data.name)
            }
        })
        return derivatives
    }
}

/**
 * Возвращает строку более сложного аспекта, если он базовый; иначе false
 *
 * @param aspect Базовый аспект
 * @return Строку аспекта или false
 */
export function toHarder(aspect: string): string | false {
    switch (aspect) {
        case "aer":
            return "arbor"
        case "ordo":
            return "vitreus"
        case "terra":
            return "victus"
        case "perditio":
            return "vacuos"
        case "aqua":
            return "victus"
        case "ignis":
            return "potentia"
        default:
            return false
    }
}

/**
 * Генерирует все существующие аспекты и их картинки во внутреннюю коллекцию
 */
export async function generateAspects() {
    aspects.set("ignis", {data: new Aspect("ignis")})

    aspects.set("aqua", {data: new Aspect("aqua")})
    aspects.set("aer", {data: new Aspect("aer")})
    aspects.set("perditio", {data: new Aspect("perditio")})
    aspects.set("ordo", {data: new Aspect("ordo")})
    aspects.set("terra", {data: new Aspect("terra")})

    aspects.set("gelum", {data: new Aspect("gelum", [getAspect("ignis"), getAspect("perditio")])})
    aspects.set("lux", {data: new Aspect("lux", [getAspect("aer"), getAspect("ignis")])})
    aspects.set("motus", {data: new Aspect("motus", [getAspect("aer"), getAspect("ordo")])})
    aspects.set("permutatio", {data: new Aspect("permutatio", [getAspect("perditio"), getAspect("ordo")])})
    aspects.set("potentia", {data: new Aspect("potentia", [getAspect("ordo"), getAspect("ignis")])})
    aspects.set("tempestas", {data: new Aspect("tempestas", [getAspect("aer"), getAspect("aqua")])})
    aspects.set("vacuos", {data: new Aspect("vacuos", [getAspect("aer"), getAspect("perditio")])})
    aspects.set("venenum", {data: new Aspect("venenum", [getAspect("aqua"), getAspect("perditio")])})
    aspects.set("victus", {data: new Aspect("victus", [getAspect("terra"), getAspect("aqua")])})
    aspects.set("vitreus", {data: new Aspect("vitreus", [getAspect("terra"), getAspect("ordo")])})

    aspects.set("bestia", {data: new Aspect("bestia", [getAspect("victus"), getAspect("motus")])})
    aspects.set("fames", {data: new Aspect("fames", [getAspect("vacuos"), getAspect("victus")])})
    aspects.set("herba", {data: new Aspect("herba", [getAspect("terra"), getAspect("victus")])})
    aspects.set("iter", {data: new Aspect("iter", [getAspect("motus"), getAspect("terra")])})
    aspects.set("limus", {data: new Aspect("limus", [getAspect("aqua"), getAspect("victus")])})
    aspects.set("metallum", {data: new Aspect("metallum", [getAspect("terra"), getAspect("vitreus")])})
    aspects.set("mortuus", {data: new Aspect("mortuus", [getAspect("perditio"), getAspect("victus")])})
    aspects.set("praecantatio", {data: new Aspect("praecantatio", [getAspect("vacuos"), getAspect("potentia")])})
    aspects.set("sano", {data: new Aspect("sano", [getAspect("ordo"), getAspect("victus")])})
    aspects.set("tenebrae", {data: new Aspect("tenebrae", [getAspect("lux"), getAspect("vacuos")])})
    aspects.set("vinculum", {data: new Aspect("vinculum", [getAspect("perditio"), getAspect("motus")])})
    aspects.set("volatus", {data: new Aspect("volatus", [getAspect("aer"), getAspect("terra")])})

    aspects.set("alienis", {data: new Aspect("alienis", [getAspect("vacuos"), getAspect("tenebrae")])})
    aspects.set("arbor", {data: new Aspect("arbor", [getAspect("aer"), getAspect("herba")])})
    aspects.set("auram", {data: new Aspect("auram", [getAspect("aer"), getAspect("praecantatio")])})
    aspects.set("corpus", {data: new Aspect("corpus", [getAspect("bestia"), getAspect("mortuus")])})
    aspects.set("exanimis", {data: new Aspect("exanimis", [getAspect("mortuus"), getAspect("motus")])})
    aspects.set("spiritus", {data: new Aspect("spiritus", [getAspect("victus"), getAspect("mortuus")])})
    aspects.set("vitium", {data: new Aspect("vitium", [getAspect("perditio"), getAspect("praecantatio")])})

    aspects.set("cognitio", {data: new Aspect("cognitio", [getAspect("ignis"), getAspect("spiritus")])})
    aspects.set("sensus", {data: new Aspect("sensus", [getAspect("aer"), getAspect("spiritus")])})

    aspects.set("humanus", {data: new Aspect("humanus", [getAspect("bestia"), getAspect("cognitio")])})

    aspects.set("instrumentum", {data: new Aspect("instrumentum", [getAspect("ordo"), getAspect("humanus")])})
    aspects.set("lucrum", {data: new Aspect("lucrum", [getAspect("fames"), getAspect("humanus")])})
    aspects.set("messis", {data: new Aspect("messis", [getAspect("herba"), getAspect("humanus")])})
    aspects.set("perfodio", {data: new Aspect("perfodio", [getAspect("terra"), getAspect("humanus")])})

    aspects.set("fabrico", {data: new Aspect("fabrico", [getAspect("humanus"), getAspect("instrumentum")])})
    aspects.set("machina", {data: new Aspect("machina", [getAspect("motus"), getAspect("instrumentum")])})
    aspects.set("meto", {data: new Aspect("meto", [getAspect("instrumentum"), getAspect("messis")])})
    aspects.set("pannus", {data: new Aspect("pannus", [getAspect("bestia"), getAspect("instrumentum")])})
    aspects.set("telum", {data: new Aspect("telum", [getAspect("ignis"), getAspect("instrumentum")])})
    aspects.set("tutamen", {data: new Aspect("tutamen", [getAspect("terra"), getAspect("instrumentum")])})

    aspects.forEach(getAspectFromDisk);

    async function getAspectFromDisk(item: { data: Aspect, image?: Jimp }) {
        let image = await Jimp.read(`images/aspects/${item.data.name}.png`)

        aspects.set(item.data.name, {data: item.data, image})
    }
}