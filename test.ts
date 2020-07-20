import {
  assertThrowsAsync,
  createHttpError,
  RouterContext,
  ServerRequest,
  httpErrors,
  Request,
} from "./deps.ts";
import {
  coreMiddleware,
} from "./mod.ts";

const encoder = new TextEncoder();

function createMockBodyReader(body: string): Deno.Reader {
  const buf = encoder.encode(body);
  let offset = 0;
  return {
    async read(p: Uint8Array): Promise<number | null> {
      if (offset >= buf.length) {
        return null;
      }
      const chunkSize = Math.min(p.length, buf.length - offset);
      p.set(buf);
      offset += chunkSize;
      return chunkSize;
    },
  };
}

interface MockServerRequestOptions {
  url?: string;
  host?: string;
  body?: string;
  headerValues?: Record<string, string>;
  proto?: string;
}

function createMockServerRequest(
  {
    url = "/",
    host = "localhost",
    body = "",
    headerValues = {},
    proto = "HTTP/1.1",
  }: MockServerRequestOptions = {},
): ServerRequest {
  const headers = new Headers();
  headers.set("host", host);
  for (const [key, value] of Object.entries(headerValues)) {
    headers.set(key, value);
  }
  if (body.length && !headers.has("content-length")) {
    headers.set("content-length", String(body.length));
  }
  return {
    headers,
    method: "GET",
    url,
    proto,
    body: createMockBodyReader(body),
    async respond() { },
  } as any;
}

const mockContext = (
  params: Record<string, string> = {},
  body: string = "",
  bodyType: string = "application/json",
): RouterContext => {
  const request = new Request(createMockServerRequest({
    url: createMockUrl(params),
    body,
    headerValues: {
      "Content-Type": bodyType,
    },
  }));
  const result = {
    params,
    request,
    throw: (status: number, msg: string) => {
      throw createHttpError(status, msg);
    },
  };

  return result as unknown as RouterContext;
};

const mockNext = () => {
  return new Promise<void>((resolve) => {
    resolve();
  });
};

const createMockUrl = (object: Record<string, string>) => {
  let result = `http://foo.bar/?`;
  for (let [key, value] of Object.entries(object)) {
    result += `&${key}=${value}`;
  }
  result = result.replace("?&", "?");
  result = result.endsWith("?") ? result.slice(undefined, -1) : result;
  return result;
};

const tests: any[] = [];

for await (const test of tests) {
  Deno.test(test);
}
