import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum LoginTypeEnum {
  "LV" = "LV",
  "LEGACY" = "LEGACY",
}
export type LoginTypeT = t.TypeOf<typeof LoginType>;
export const LoginType = enumType<LoginTypeEnum>(LoginTypeEnum, "LoginType");
