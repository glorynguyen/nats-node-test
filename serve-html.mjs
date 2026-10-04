import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

const port = Number(process.env.PORT || 8000);
const pageUrl = new URL("./index.html", import.meta.url);

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;

  if (request.method !== "GET") {
    response.writeHead(405, { Allow: "GET" });
    response.end("Method Not Allowed");
    return;
  }

  if (pathname !== "/" && pathname !== "/index.html") {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  try {
    const html = await readFile(pageUrl);
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(html);
  } catch (err) {
    console.error("Failed to read index.html:", err.message);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Unable to load the page");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving index.html at http://localhost:${port}/`);
});