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

const primalAspects = ["terra", "aqua", "aer", "ignis", "perditio", "ordo"] // отсортированы в порядке ценности

const primalAspectLinks: Map<string, Array<string>> = new Map() // кеш невозможных крафтов

/**
 * Возвращает массив всех аспектов в коллекции
 * @return массив аспектов
 */
export function aspectsGetArray() {
    return [...aspects]
}

export function increaseLength(aspects: Array<string>, count: number): Array<string> {
    let returnArray = [...aspects]
    if (aspects.length === 0) return returnArray

    if (aspects.length % 2 === count % 2) {
        let times = count / aspects.length
        for (let i = 0; i < times; i++) {
            if (aspects.length >= 2) {
                returnArray.push( // 2 последних аспекта
                    aspects[aspects.length - 2],
                    aspects[aspects.length - 1])
            } else if (aspects.length == 1) {
                returnArray.push(
                    derivative(aspects[0])[0],
                    aspects[aspects.length - 1])
            }
        }
    }
    return returnArray
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

    getPath(aspect1, aspect2, various)

    if (various.length === 0) { // наобарот
        getPath(aspect2, aspect1, various)
        for (let i = 0; i < various.length; i++) { // сделать обратный порядок следования
            various[i] = various[i].reverse()
        }
    }

    if (various.length === 0) { // более глубокий метод
        if (primalAspects.includes(aspect1)) return various

        for (const primalAspect of primalAspects) {
            if (simplify(primalAspect, aspect1) && simplify(primalAspect, aspect2)) {
                various = getLinks(aspect1, primalAspect)
                let various2: typeof various = []
                for (let i = 0; i < various.length; i++) {
                    various[i].push(primalAspect)
                    getPath(primalAspect, aspect2, various2, various[i])
                }
                various = various2
                break
            }
        }

        for (let i = 0; i < various.length; i++) {
            removeExcess(various[i])
        }
    }

    various.sort((a, b) => { // сортировка по возрастанию количества
        return a.length - b.length
    })
    return various

    /**
     * Удаляет из массива одинаковые вхождения, и все что между ними
     * @param array Ссылка на массив
     */
    function removeExcess(array: Array<string>) {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array.length; j++) {
                let lastIndex = array.length - 1 - j
                if (array[i] === array[lastIndex]) {
                    let count = lastIndex - i
                    array = array.splice(i + 1, count)
                }
            }
        }
    }


    /**
     * Заполняет внутренний массив всеми возможными односторонними цепями соединений аспектов
     * @param from Приводимый аспект
     * @param to Аспект, к которому приводят
     * @param paths Ссылка на заполняемый массив
     * @param path Изначальная цепь
     */
    function getPath(from: string, to: string, paths: Array<Array<string>>, path: Array<string> = []): Array<string> {
        let aspects: Array<string>
        if (path.length !== 0) {
            aspects = derivative(path[path.length - 1])
        } else {
            aspects = derivative(from)
        }

        for (let i = 0; i < aspects.length; i++) {
            if (aspects[i] === to) {
                paths.push(path)
                return []
            } else {
                let res = getPath(from, to, paths, [...path, aspects[i]])
                path.push(...res)
            }
        }
        return []
    }
}

/**
 * Возвращает все производные аспекта
 * @param aspect Аспект
 * @return Массив аспектов
 */
function derivative(aspect: string): Array<string> {
    let derivatives: Array<string> = []
    aspects.forEach((item) => {
        if (item.data.contain(aspect)) {
            derivatives.push(item.data.name)
        }
    })
    return derivatives
}

export function simplify(primalAspect: string, aspect: string): boolean {
    let allAspects = aspectsGetArray()
    let array = getNotCraftableAspects(primalAspect)
    for (const name of array) {
        if (name === aspect) return false
    }
    return true

    function getNotCraftableAspects(primalAspect: string): string[] {
        let links = primalAspectLinks.get(primalAspect)
        if (links) {
            return links
        }

        if (primalAspects.includes(primalAspect)) {
            let aspects = []
            for (let i = 0; i < allAspects.length; i++) {
                if (getLinks(primalAspect, allAspects[i][0]).length == 0) {
                    aspects.push(allAspects[i][0])
                }
            }
            primalAspectLinks.set(primalAspect, aspects) // кэширование из-за низкой скорости
            return aspects
        } else {
            return []
        }

        // switch (primalAspect) {
        //     case "perditio":
        //         return ["lux", "motus", "potentia", "tempestas", "victus", "vitreus", "bestia", "herba", "iter", "limus", "metallum", "sano", "volatus", "arbor"]
        //     case "aer":
        //         return ["gelum", "permutatio", "potentia", "venenum", "victus", "vitreus", "herba", "limus", "metallum", "mortuus", "sano", "spiritus", "cognitio"]
        //     case ""
        //     default:
        //         return []
        // }
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