import { IConfig } from "./config";

export const getFunctionsAuth = (config: IConfig) => ({
  "X-Functions-Key": config.FAST_LOGIN_API_KEY,
});
