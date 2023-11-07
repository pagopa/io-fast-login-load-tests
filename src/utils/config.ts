import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as E from "fp-ts/Either";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";

export const IConfig = t.type({
  FAST_LOGIN_API_KEY: t.string,
  FAST_LOGIN_BASE_URL: t.string,
  IO_BACKEND_BASE_URL: t.string,
});
export type IConfig = t.TypeOf<typeof IConfig>;

export const getConfigOrThrow = () =>
  pipe(
    __ENV,
    IConfig.decode,
    E.getOrElseW((errs) => {
      throw new Error(readableReportSimplified(errs));
    })
  );
