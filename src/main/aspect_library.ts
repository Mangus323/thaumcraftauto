import Jimp from "jimp";
import pixelmatch from "pixelmatch";

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
    contain = (aspect: Aspect) => {
        if (this.contains !== null) {
            if (this.contains[0] !== undefined && this.contains[1] !== undefined) {
                if (aspect.name === this.contains[0].name || aspect.name === this.contains[1].name) {
                    return true
                }
            }
        }
        return false
    }
}

export const aspectsFromDisk: Map<string, Jimp> = new Map()

export const aspects: Map<string, Aspect> = new Map();
export function getAspect(name: string): Aspect {
    let aspect = aspects.get(name)
    if(aspect) {
        return aspect
    } else {
        return new Aspect("err")
    }
}

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

export function generateAspects() {
    aspects.set("ignis", new Aspect("ignis"))

    aspects.set("aqua", new Aspect("aqua"))
    aspects.set("aer", new Aspect("aer"))
    aspects.set("perditio", new Aspect("perditio"))
    aspects.set("ordo", new Aspect("ordo"))
    aspects.set("terra", new Aspect("terra"))

    aspects.set("gelum", new Aspect("gelum", [getAspect("ignis"), getAspect("perditio")]))
    aspects.set("lux", new Aspect("lux", [getAspect("aer"), getAspect("ignis")]))
    aspects.set("motus", new Aspect("motus", [getAspect("aer"), getAspect("ordo")]))
    aspects.set("permutatio", new Aspect("permutatio", [getAspect("perditio"), getAspect("ordo")]))
    aspects.set("potentia", new Aspect("potentia", [getAspect("ordo"), getAspect("ignis")]))
    aspects.set("tempestas", new Aspect("tempestas", [getAspect("aer"), getAspect("aqua")]))
    aspects.set("vacuos", new Aspect("vacuos", [getAspect("aer"), getAspect("perditio")]))
    aspects.set("venenum", new Aspect("venenum", [getAspect("aqua"), getAspect("perditio")]))
    aspects.set("victus", new Aspect("victus", [getAspect("terra"), getAspect("aqua")]))
    aspects.set("vitreus", new Aspect("vitreus", [getAspect("terra"), getAspect("ordo")]))

    aspects.set("bestia", new Aspect("bestia", [getAspect("victus"), getAspect("terra")]))
    aspects.set("fames", new Aspect("fames", [getAspect("vacuos"), getAspect("victus")]))
    aspects.set("herba", new Aspect("herba", [getAspect("terra"), getAspect("victus")]))
    aspects.set("iter", new Aspect("iter", [getAspect("motus"), getAspect("terra")]))
    aspects.set("limus", new Aspect("limus", [getAspect("aqua"), getAspect("victus")]))
    aspects.set("metallum", new Aspect("metallum", [getAspect("terra"), getAspect("vitreus")]))
    aspects.set("mortuus", new Aspect("mortuus", [getAspect("perditio"), getAspect("victus")]))
    aspects.set("praecantatio", new Aspect("praecantatio", [getAspect("vacuos"), getAspect("potentia")]))
    aspects.set("sano", new Aspect("sano", [getAspect("ordo"), getAspect("victus")]))
    aspects.set("tenebrae", new Aspect("tenebrae", [getAspect("lux"), getAspect("vacuos")]))
    aspects.set("vinculum", new Aspect("vinculum", [getAspect("perditio"), getAspect("motus")]))
    aspects.set("volatus", new Aspect("volatus", [getAspect("aer"), getAspect("terra")]))

    aspects.set("alienis", new Aspect("alienis", [getAspect("vacuos"), getAspect("tenebrae")]))
    aspects.set("arbor", new Aspect("arbor", [getAspect("aer"), getAspect("herba")]))
    aspects.set("auram", new Aspect("auram", [getAspect("aer"), getAspect("praecantatio")]))
    aspects.set("corpus", new Aspect("corpus", [getAspect("bestia"), getAspect("mortuus")]))
    aspects.set("exanimis", new Aspect("exanimis", [getAspect("mortuus"), getAspect("motus")]))
    aspects.set("spiritus", new Aspect("spiritus", [getAspect("victus"), getAspect("mortuus")]))
    aspects.set("vitium", new Aspect("vitium", [getAspect("perditio"), getAspect("praecantatio")]))

    aspects.set("cognitio", new Aspect("cognitio", [getAspect("ignis"), getAspect("spiritus")]))
    aspects.set("sensus", new Aspect("sensus", [getAspect("aer"), getAspect("spiritus")]))

    aspects.set("humanus", new Aspect("humanus", [getAspect("bestia"), getAspect("cognitio")]))

    aspects.set("instrumentum", new Aspect("instrumentum", [getAspect("ordo"), getAspect("humanus")]))
    aspects.set("lucrum", new Aspect("lucrum", [getAspect("fames"), getAspect("humanus")]))
    aspects.set("messis", new Aspect("messis", [getAspect("herba"), getAspect("humanus")]))
    aspects.set("perfodio", new Aspect("perfodio", [getAspect("terra"), getAspect("humanus")]))

    aspects.set("fabrico", new Aspect("fabrico", [getAspect("humanus"), getAspect("instrumentum")]))
    aspects.set("machina", new Aspect("machina", [getAspect("motus"), getAspect("instrumentum")]))
    aspects.set("meto", new Aspect("meto", [getAspect("instrumentum"), getAspect("messis")]))
    aspects.set("pannus", new Aspect("pannus", [getAspect("bestia"), getAspect("instrumentum")]))
    aspects.set("telum", new Aspect("telum", [getAspect("ignis"), getAspect("instrumentum")]))
    aspects.set("tutamen", new Aspect("tutamen", [getAspect("terra"), getAspect("instrumentum")]))
}

export async function getAspectsFromDisk() {
    let array: Array<Aspect> = [];
    aspects.forEach((item) => {
        array.push(item)
    });
    for (let i = 0; i < array.length; i++) {
        await setAspect(array[i]);
    }

    async function setAspect(item: any) {
        let image = await Jimp.read(`images/aspects/${item.name}.png`)
        aspectsFromDisk.set(item.name, image)

    }
}

export function compareImages(images: Array<Jimp>): number {
    return pixelmatch(
        images[0].bitmap.data,
        images[1].bitmap.data,
        null, 60, 60)
}

export function compareWithAspect(image: Jimp, aspectName: string, masks?: Array<Jimp>): number {
    let aspect = aspectsFromDisk.get(aspectName)
    if (aspect !== undefined) {
        if (masks !== undefined) {
            for (const mask of masks) {
                aspect.mask(mask, 0, 0)
                image.mask(mask, 0, 0)
            }
        }
        return compareImages([aspect, image])
    } else
        return -1
}