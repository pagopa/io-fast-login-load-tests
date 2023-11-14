import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as E from "fp-ts/Either";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

export const IConfig = t.type({
  FN_LOLLIPOP_API_KEY: t.string,
  FN_LOLLIPOP_BASE_URL: t.string,
  IO_BACKEND_BASE_URL: t.string,
  IO_BACKEND_TEST_PASSWD: NonEmptyString,
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
