import { packInfo } from './types/typing';

/**
 * Convert media to playable WhatsApp Audio
 * @param file arrayBuffer of file
 * @param ext file extension
 */
declare function toAudio(file: ArrayBuffer, ext: string): Promise<any>;

/**
 * Convert media to playable WhatsApp Video
 * @param file arrayBuffer of file
 * @param ext file extension
 */
declare function toVideo(file: ArrayBuffer, ext: string): Promise<any>;

/**
 * Convert media to playable WhatsApp PTT
 * @param file arrayBuffer of file
 * @param ext file extension
 */
declare function toOpus(file: ArrayBuffer, ext: string): Promise<any>;

/**
 * Convert your media to webp
 * @param file arrayBuffer of file
 * @param opts convert stickerOptions
 */
declare function sticker(file: ArrayBuffer, opts: {
    isImage?: boolean
    isVideo?: boolean
    cmdType?: "1" | "2"
    withPackInfo?: boolean
    packInfo?: packInfo
}): Promise<any>;