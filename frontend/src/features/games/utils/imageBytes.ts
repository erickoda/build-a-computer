export function fileToByteArray(file: File): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(Array.from(new Uint8Array(reader.result as ArrayBuffer)));
    reader.onerror = () => reject(reader.error);

    reader.readAsArrayBuffer(file);
  });
}

export function bytesToDataUrl(bytes?: number[] | null, mime = "image/png"): string | undefined {
  if (!bytes || bytes.length === 0) return undefined;

  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }

  return `data:${mime};base64,${btoa(binary)}`;
}
