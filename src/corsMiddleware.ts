import {
  RouterMiddleware,
  ErrorStatus,
  BodyType,
  RouterContext,
  HTTPMethods,
  Status,
} from "../deps.ts";

export type CorsMiddlewareOptions = {
  origin: string;
  methods: Array<HTTPMethods | string>;
  preflightContinue: boolean;
  optionsSuccessStatus: Status | number;
  credentials: boolean;
  allowedHeaders?: string[];
  headers?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
};

type HeaderObject = {
  key: string;
  value: string;
};

export type AllowedOrigin = RegExp | string | Array<RegExp | string>;

const defaultOptions: CorsMiddlewareOptions = {
  origin: "*",
  methods: ["HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: false,
};

const isString = (s: any): s is string => {
  return typeof s === "string" || s instanceof String;
};

const isOriginAllowed = (
  origin: string,
  allowedOrigin: AllowedOrigin,
) => {
  if (Array.isArray(allowedOrigin)) {
    for (let i = 0; i < allowedOrigin.length; ++i) {
      if (isOriginAllowed(origin, allowedOrigin[i])) {
        return true;
      }
    }
    return false;
  } else if (isString(allowedOrigin)) {
    return origin === allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  } else {
    return !!allowedOrigin;
  }
};

const configureOrigin = (
  options: CorsMiddlewareOptions,
  ctx: RouterContext,
) => {
  const requestOrigin = ctx.request.headers.get("origin") ?? "";
  const headers = [];

  if (!options.origin || options.origin === "*") {
    // allow any origin
    headers.push([{
      key: "Access-Control-Allow-Origin",
      value: "*",
    }]);
  } else if (isString(options.origin)) {
    // fixed origin
    headers.push([
      {
        key: "Access-Control-Allow-Origin",
        value: options.origin,
      },
      {
        key: "Vary",
        value: "Origin",
      },
    ]);
  } else {
    const isAllowed = isOriginAllowed(requestOrigin, options.origin);
    // reflect origin
    headers.push([
      {
        key: "Access-Control-Allow-Origin",
        value: isAllowed ? requestOrigin : false,
      },
      {
        key: "Vary",
        value: "Origin",
      },
    ]);
  }

  return headers;
};

const configureMethods = (options: CorsMiddlewareOptions) => {
  return {
    key: "Access-Control-Allow-Methods",
    value: options.methods.join(","),
  };
};

const configureCredentials = (options: CorsMiddlewareOptions) => {
  if (options.credentials === true) {
    return {
      key: "Access-Control-Allow-Credentials",
      value: "true",
    };
  }
  return null;
};

const configureAllowedHeaders = (
  options: CorsMiddlewareOptions,
  ctx: RouterContext,
) => {
  let allowedHeaders: string | string[] = options.allowedHeaders ||
    options.headers;
  const headers = [];

  if (!allowedHeaders) {
    allowedHeaders =
      ctx.request.headers.get("access-control-request-headers") || ""; // .headers wasn't specified, so reflect the request headers
    headers.push([{
      key: "Vary",
      value: "Access-Control-Request-Headers",
    }]);
  } else if (allowedHeaders.join) {
    allowedHeaders = allowedHeaders.join(","); // .headers is an array, so turn it into a string
  }
  if (allowedHeaders && allowedHeaders.length) {
    headers.push([{
      key: "Access-Control-Allow-Headers",
      value: allowedHeaders,
    }]);
  }

  return headers;
};

const configureExposedHeaders = (options: CorsMiddlewareOptions) => {
  const headers = options.exposedHeaders;
  if (!headers) {
    return null;
  }
  if (headers && headers.length) {
    return {
      key: "Access-Control-Expose-Headers",
      value: headers,
    };
  }
  return null;
};

const configureMaxAge = (options: CorsMiddlewareOptions) => {
  const maxAge = (typeof options.maxAge === "number" || options.maxAge) &&
    options.maxAge.toString();
  if (maxAge && maxAge.length) {
    return {
      key: "Access-Control-Max-Age",
      value: maxAge,
    };
  }
  return null;
};

const applyHeaders = (headers: HeaderObject[], ctx: RouterContext) => {
  for (const header of headers) {
    if (header) {
      if (Array.isArray(header)) {
        applyHeaders(header, ctx);
      } else if (header.key === "Vary" && header.value) {
        ctx.response.headers.append("Vary", header.value);
      } else if (header.value) {
        ctx.response.headers.set(header.key, header.value);
      }
    }
  }
};

const handlePreflight = (
  options: CorsMiddlewareOptions,
  ctx: RouterContext,
  next: () => Promise<void>,
) => {
  const headers = [];
  // preflight
  headers.push(configureOrigin(options, ctx));
  headers.push(configureCredentials(options));
  headers.push(configureMethods(options));
  headers.push(configureAllowedHeaders(options, ctx));
  headers.push(configureMaxAge(options));
  headers.push(configureExposedHeaders(options));
  applyHeaders(headers, ctx);

  if (options.preflightContinue) {
    next();
  } else {
    // Safari (and potentially other browsers) need content-length 0,
    //   for 204 or they just hang waiting for a body
    ctx.response.status = options.optionsSuccessStatus;
    ctx.response.headers.set("Content-Length", "0");
  }
};

/** Validatior middleware */
export const coreMiddleware = (options: Partial<CorsMiddlewareOptions>) => {
  const corsOptions: CorsMiddlewareOptions = Object.assign(
    {},
    defaultOptions,
    options,
  );

  const core: RouterMiddleware = async (ctx, next) => {
    handlePreflight(corsOptions, ctx, next);
    await next();
  };

  return core;
};

export default { coreMiddleware };
