import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as jose from "jose";
import { JwkPubKeyHashAlgorithmEnum } from "../generated/definitions/lollipop/JwkPubKeyHashAlgorithm";
import { flow, pipe } from "fp-ts/lib/function";
import { JwkPubKey } from "../generated/definitions/lollipop/JwkPubKey";
import * as E from "fp-ts/Either";
import { createClient } from "../generated/definitions/login/client";
import nodeFetch from "node-fetch";
import { IConfig, getConfigOrThrow } from "./config";
import * as TE from "fp-ts/TaskEither";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import * as r from "@pagopa/ts-commons/lib/requests";
import { LoginTypeEnum } from "../types/login";
import { JwkPublicKeyFromToken } from "@pagopa/ts-commons/lib/jwk";
import { AccessToken } from "../generated/definitions/login/AccessToken";

/**
 * Execute a test login with lollipop parameters to bind a key to a test User.
 * Returns the private key that can be used to perform lollipop request and
 * Fast Login token refresh.
 */
export const initNewLollipopKey = (config: IConfig) => async (
  fiscalCode: FiscalCode
): Promise<jose.KeyLike> => {
  const { publicKey, privateKey } = await jose.generateKeyPair("ES256");
  const publicJwk = await jose.exportJWK(publicKey);
  const newPubKey = pipe(
    publicJwk,
    JwkPubKey.decode,
    E.map((jwk) => ({
      algo: JwkPubKeyHashAlgorithmEnum.sha256,
      pub_key: jwk,
      pub_key_token: JwkPublicKeyFromToken.encode(jwk),
    })),
    E.getOrElseW(() => {
      throw new Error("Invalid Key");
    })
  );
  const loginIOBackendClient = createClient({
    basePath: "",
    baseUrl: config.IO_BACKEND_BASE_URL,
    fetchApi: (nodeFetch as any) as typeof fetch,
  });
  return pipe(
    TE.tryCatch(
      () =>
        loginIOBackendClient.testLogin({
          loginType: LoginTypeEnum.LV,
          "x-pagopa-lollipop-pub-key-hash-algo":
            JwkPubKeyHashAlgorithmEnum.sha256,
          "x-pagopa-lollipop-pub-key": newPubKey.pub_key_token,
          body: {
            username: fiscalCode,
            password: config.IO_BACKEND_TEST_PASSWD,
          },
        }),
      E.toError
    ),
    TE.chain(
      flow(
        TE.fromEither,
        TE.mapLeft((errs) => new Error(readableReportSimplified(errs)))
      )
    ),
    TE.chain(
      flow(
        TE.fromPredicate(
          (_): _ is r.IResponseType<200, AccessToken, never> =>
            _.status === 200,
          (res) => new Error(`Test Login: [status ${res.status}]`)
        ),
        TE.map(() => privateKey)
      )
    ),
    TE.getOrElse((err) => {
      console.error(err);
      throw err;
    })
  )();
};
const config = getConfigOrThrow();
initNewLollipopKey(config)("AAAAAA00A00A000D" as FiscalCode).catch((err) =>
  console.error(err)
);
