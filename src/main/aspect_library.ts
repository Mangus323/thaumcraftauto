import Jimp from "jimp";
import pixelmatch from "pixelmatch";

export class Aspect {
    constructor(name: string, contains?: Array<Aspect | undefined>) {
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
    contains: Array<Aspect | undefined> | null
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

export let aspectsFromDisk: Map<string, Jimp> = new Map()

export let aspects: Map<string, Aspect> = new Map();

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

    aspects.set("gelum", new Aspect("gelum", [aspects.get("ignis"), aspects.get("perditio")]))
    aspects.set("lux", new Aspect("lux", [aspects.get("aer"), aspects.get("ignis")]))
    aspects.set("motus", new Aspect("motus", [aspects.get("aer"), aspects.get("ordo")]))
    aspects.set("permutatio", new Aspect("permutatio", [aspects.get("perditio"), aspects.get("ordo")]))
    aspects.set("potentia", new Aspect("potentia", [aspects.get("ordo"), aspects.get("ignis")]))
    aspects.set("tempestas", new Aspect("tempestas", [aspects.get("aer"), aspects.get("aqua")]))
    aspects.set("vacuos", new Aspect("vacuos", [aspects.get("aer"), aspects.get("perditio")]))
    aspects.set("venenum", new Aspect("venenum", [aspects.get("aqua"), aspects.get("perditio")]))
    aspects.set("victus", new Aspect("victus", [aspects.get("terra"), aspects.get("aqua")]))
    aspects.set("vitreus", new Aspect("vitreus", [aspects.get("terra"), aspects.get("ordo")]))

    aspects.set("bestia", new Aspect("bestia", [aspects.get("victus"), aspects.get("terra")]))
    aspects.set("fames", new Aspect("fames", [aspects.get("vacuos"), aspects.get("victus")]))
    aspects.set("herba", new Aspect("herba", [aspects.get("terra"), aspects.get("victus")]))
    aspects.set("iter", new Aspect("iter", [aspects.get("motus"), aspects.get("terra")]))
    aspects.set("limus", new Aspect("limus", [aspects.get("aqua"), aspects.get("victus")]))
    aspects.set("metallum", new Aspect("metallum", [aspects.get("terra"), aspects.get("vitreus")]))
    aspects.set("mortuus", new Aspect("mortuus", [aspects.get("perditio"), aspects.get("victus")]))
    aspects.set("praecantatio", new Aspect("praecantatio", [aspects.get("vacuos"), aspects.get("potentia")]))
    aspects.set("sano", new Aspect("sano", [aspects.get("ordo"), aspects.get("victus")]))
    aspects.set("tenebrae", new Aspect("tenebrae", [aspects.get("lux"), aspects.get("vacuos")]))
    aspects.set("vinculum", new Aspect("vinculum", [aspects.get("perditio"), aspects.get("motus")]))
    aspects.set("volatus", new Aspect("volatus", [aspects.get("aer"), aspects.get("terra")]))

    aspects.set("alienis", new Aspect("alienis", [aspects.get("vacuos"), aspects.get("tenebrae")]))
    aspects.set("arbor", new Aspect("arbor", [aspects.get("aer"), aspects.get("herba")]))
    aspects.set("auram", new Aspect("auram", [aspects.get("aer"), aspects.get("praecantatio")]))
    aspects.set("corpus", new Aspect("corpus", [aspects.get("bestia"), aspects.get("mortuus")]))
    aspects.set("exanimis", new Aspect("exanimis", [aspects.get("mortuus"), aspects.get("motus")]))
    aspects.set("spiritus", new Aspect("spiritus", [aspects.get("victus"), aspects.get("mortuus")]))
    aspects.set("vitium", new Aspect("vitium", [aspects.get("perditio"), aspects.get("praecantatio")]))

    aspects.set("cognitio", new Aspect("cognitio", [aspects.get("ignis"), aspects.get("spiritus")]))
    aspects.set("sensus", new Aspect("sensus", [aspects.get("aer"), aspects.get("spiritus")]))

    aspects.set("humanus", new Aspect("humanus", [aspects.get("bestia"), aspects.get("cognitio")]))

    aspects.set("instrumentum", new Aspect("instrumentum", [aspects.get("ordo"), aspects.get("humanus")]))
    aspects.set("lucrum", new Aspect("lucrum", [aspects.get("fames"), aspects.get("humanus")]))
    aspects.set("messis", new Aspect("messis", [aspects.get("herba"), aspects.get("humanus")]))
    aspects.set("perfodio", new Aspect("perfodio", [aspects.get("terra"), aspects.get("humanus")]))

    aspects.set("fabrico", new Aspect("fabrico", [aspects.get("humanus"), aspects.get("instrumentum")]))
    aspects.set("machina", new Aspect("machina", [aspects.get("motus"), aspects.get("instrumentum")]))
    aspects.set("meto", new Aspect("meto", [aspects.get("instrumentum"), aspects.get("messis")]))
    aspects.set("pannus", new Aspect("pannus", [aspects.get("bestia"), aspects.get("instrumentum")]))
    aspects.set("telum", new Aspect("telum", [aspects.get("ignis"), aspects.get("instrumentum")]))
    aspects.set("tutamen", new Aspect("tutamen", [aspects.get("terra"), aspects.get("instrumentum")]))
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