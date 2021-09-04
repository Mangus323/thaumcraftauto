import Jimp from "jimp";
import pixelmatch from "pixelmatch";
import {getAspectImage} from "./aspect_library";

/**
 * Возвращает число разных пикселей 2 картинок
 * @param images Массив из 2 картинок
 */
export function compareImages(images: Array<Jimp>): number {
    return pixelmatch(
        images[0].bitmap.data,
        images[1].bitmap.data,
        null, 60, 60)
}

/**
 * Возвращает число разных пикселей картинки и аспекта
 * @param image картинка
 * @param name название аспекта
 * @param masks маски картинок
 * @return {number} разница
 */
export function compareWithAspect(image: Jimp, name: string, masks?: Array<Jimp>): number {
    let ref = getAspectImage(name)
    if (ref !== undefined) {
        let aspect = ref.clone()
        if (masks !== undefined) {
            for (const mask of masks) {
                aspect.mask(mask, 0, 0)
                image.mask(mask, 0, 0)
            }
        }
        return compareImages([aspect, image])
    }
    return 10000
}

