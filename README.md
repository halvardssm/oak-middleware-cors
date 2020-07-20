# Oak Middleware Validator

[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/halvardssm/oak-middleware-validator/ci/master?style=flat-square&logo=github)](https://github.com/halvardssm/oak-middleware-validator/actions?query=branch%3Amaster+workflow%3ACI)
[![(Deno)](https://img.shields.io/badge/deno-v1.1.3-green.svg?style=flat-square&logo=deno)](https://deno.land)
[![deno doc](https://img.shields.io/badge/deno-doc-blue.svg?style=flat-square&logo=deno)](https://doc.deno.land/https/raw.githubusercontent.com/halvardssm/oak-middleware-validator/master/mod.ts)

Oak middleware for parameter and body validator loosely ported from [express cors](https://github.com/expressjs/cors/)

## Usage

* As a router middleware

  ```ts
  import { corsMiddleware, CORSMiddlewareOptions } from "https://raw.githubusercontent.com/halvardssm/oak-middleware-cors/master/mod.ts"
  import { RouterMiddleware } from "https://deno.land/x/oak/mod.ts";
  
  const router = new Router();
  const app = new Application();

  const options: CORSMiddlewareOptions ={

  }
  
  router.get("/bar", corsMiddleware(options),...)
  
  app.use(router.routes());
  
  await app.listen(appOptions);
  ```

* As a middleware

  ```ts
  import { corsMiddleware, CORSMiddlewareOptions } from "https://raw.githubusercontent.com/halvardssm/oak-middleware-cors/master/mod.ts"
  import { RouterMiddleware } from "https://deno.land/x/oak/mod.ts";
  
  const router = new Router();
  const app = new Application();

  const options: CORSMiddlewareOptions ={

  }
  
  router.get("/bar", ,...)
  
  app.use(corsMiddleware(options), router.routes());
  
  await app.listen(appOptions);
  ```

## Options

## Contributing

All contributions are welcome, make sure to read the [contributing guidelines](./.github/CONTRIBUTING.md).

## Uses

* [Oak](https://deno.land/x/oak/)
