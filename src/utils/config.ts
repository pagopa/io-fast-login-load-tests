import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as E from "fp-ts/Either";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CommaSeparatedListOf } from "./separated-list";

export const IConfig = t.type({
  IO_BACKEND_BASE_URL: t.string,
  IO_BACKEND_TEST_PASSWD: NonEmptyString,
  TEST_FISCAL_CODE: CommaSeparatedListOf(FiscalCode),
});
export type IConfig = t.TypeOf<typeof IConfig>;

export const getConfigOrThrow = (
  env: { [name: string]: string } | NodeJS.ProcessEnv
) =>
  pipe(
    env,
    IConfig.decode,
    E.getOrElseW((errs) => {
      throw new Error(readableReportSimplified(errs));
    })
  );
