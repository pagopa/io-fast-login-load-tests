import { IConfig } from "./config";

export const getFunctionsAuth = (config: IConfig) => ({
  "X-Functions-Key": config.FN_LOLLIPOP_API_KEY,
});
