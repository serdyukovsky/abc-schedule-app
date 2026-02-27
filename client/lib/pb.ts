import PocketBase from "pocketbase";

const PB_URL = (typeof window !== "undefined" && (window as any).__PB_URL__) || "http://127.0.0.1:8090";
export const pb = new PocketBase(PB_URL);

export function getFileUrl(
  collectionId: string,
  recordId: string,
  filename: string,
  thumb?: string
): string {
  const base = pb.baseURL;
  let url = `${base}/api/files/${collectionId}/${recordId}/${filename}`;
  if (thumb) url += `?thumb=${thumb}`;
  return url;
}
