import Image from '@tiptap/extension-image';
import type { Editor } from '@tiptap/react';

import { publicAssetUrl } from '@/lib/api';

export type TiptapInsertedImage = { src: string; alt?: string };

/**
 * Turns on images inside the text. Only pass it where the server sanitizer
 * keeps <img> (news articles); every other editor stays text only.
 */
export type TiptapImageOptions = {
  /** Open a picker; call `insert` once the chosen image is stored. */
  onBrowse: (insert: (image: TiptapInsertedImage) => void) => void;
  /** Store an image from a public link and resolve with its stored URL. */
  onImportUrl: (url: string) => Promise<TiptapInsertedImage>;
  /** Store a pasted or dropped file and resolve with its stored URL. */
  onUploadFile: (file: File) => Promise<TiptapInsertedImage>;
  /** Only images whose src passes this survive a paste. */
  isAllowedSrc: (src: string) => boolean;
  onError?: (message: string) => void;
};

/**
 * Stored HTML keeps the relative `/api/...` src the sanitizer accepts; only the
 * editor's own DOM points at the API origin so the picture shows while typing.
 */
export const ArticleImage = Image.extend({
  addNodeView() {
    return ({ node }) => {
      const img = document.createElement('img');
      img.src = publicAssetUrl(String(node.attrs.src ?? ''));
      img.alt = String(node.attrs.alt ?? '');
      img.draggable = true;
      return { dom: img };
    };
  },
}).configure({ inline: false, allowBase64: false });

export function insertTiptapImage(editor: Editor, image: TiptapInsertedImage) {
  editor
    .chain()
    .focus()
    .setImage({ src: image.src, alt: (image.alt ?? '').replace(/[<>]/g, '').slice(0, 255) })
    .run();
}
