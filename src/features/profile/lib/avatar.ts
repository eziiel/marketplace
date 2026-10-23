export const AVATAR_MAX_BYTES = 512 * 1024;
export const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

export type AvatarResult =
  | { ok: true; dataUrl: string }
  | { ok: false; message: string };

export async function readAvatarFile(file: File): Promise<AvatarResult> {
  if (!AVATAR_TYPES.includes(file.type)) {
    return { ok: false, message: "Use uma imagem PNG, JPEG ou WebP." };
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, message: "A imagem deve ter no máximo 512 KB." };
  }

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read-error"));
      reader.readAsDataURL(file);
    });

    return { ok: true, dataUrl };
  } catch {
    return { ok: false, message: "Não foi possível ler a imagem." };
  }
}
