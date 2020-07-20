import { RouterMiddleware, ErrorStatus, BodyType } from "../deps.ts";

export type CorsMiddlewareOptions = {
  bodyRequired?: boolean;
  bodyType?: BodyType;
};

/** Validatior middleware */
export const coreMiddleware = (options: CorsMiddlewareOptions) => {
  const defaultOptions = {
    origin: '*',
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }

  const core: RouterMiddleware = async (ctx, next) => {


    await next();
  };

  return core;
};

export default { coreMiddleware };
