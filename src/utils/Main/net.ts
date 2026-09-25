import { net, ClientRequestConstructorOptions } from "electron";

export const request = (options: ClientRequestConstructorOptions): Promise<Request.Responce> =>
  new Promise((resolve, reject) => {
    const responce: Request.Responce = {
      url: options.url,
      data: "",
    };

    net
      .request(options)
      .on("response", (res) => {
        res.on("error", (error: Error) => reject(error));
        res.on("data", (chunk) => (responce.data += chunk.toString()));
        res.on("end", () => resolve(responce));
      })
      .on("error", (error: Error) => reject(error))
      .end();
  });

export async function fetchBuffer(url: string): Promise<Buffer> {
  const response = await net.fetch(url);

  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
