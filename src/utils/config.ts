import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as E from "fp-ts/Either";

export const IConfig = t.type({
  API_KEY: t.string,
  API_URL: t.string,
});
export type IConfig = t.TypeOf<typeof IConfig>;

export const getConfigOrThrow = () =>
  pipe(
    __ENV,
    IConfig.decode,
    E.getOrElseW((errs) => {
      throw E.toError(errs);
    })
  );
