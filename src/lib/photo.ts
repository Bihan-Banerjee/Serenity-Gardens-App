import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNative } from './native';

export type PhotoSource = 'camera' | 'gallery';

const dataUrlToFile = (dataUrl: string, name: string): File => {
  const [head, body] = dataUrl.split(',');
  const mime = /data:(.*?);/.exec(head)?.[1] || 'image/jpeg';
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: mime });
};

/** Take a photo with the camera or choose one from the gallery. Resolves null if cancelled. */
export async function pickPhoto(source: PhotoSource): Promise<File | null> {
  if (isNative) {
    try {
      const photo = await Camera.getPhoto({
        quality: 75,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        correctOrientation: true,
      });
      if (!photo.dataUrl) return null;
      return dataUrlToFile(photo.dataUrl, `photo-${Date.now()}.${photo.format || 'jpg'}`);
    } catch {
      return null; // cancelled or permission denied
    }
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (source === 'camera') input.setAttribute('capture', 'environment');
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}

/** Downscale to a square JPEG data URL, small enough to keep in localStorage. */
export function toAvatarDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      canvas.getContext('2d')!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}
