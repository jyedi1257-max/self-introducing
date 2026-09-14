/**
 * 생성한 이미지를 학생 기기로만 저장한다. (서버에는 올리지 않는다)
 * 확장자는 실제 이미지 형식에 맞춘다.
 */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const mimeMatch = /^data:([^;,]+)/.exec(dataUrl);
  const mime = mimeMatch?.[1] ?? 'image/png';
  const extension = mime.split('/')[1]?.split('+')[0] ?? 'png';

  const base = fileName.replace(/\.[a-z0-9]+$/i, '').replace(/[\\/:*?"<>|]/g, '') || '내캐릭터';

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${base}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
