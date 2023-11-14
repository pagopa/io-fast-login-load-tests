import http from "k6/http";
import { getConfigOrThrow } from "./utils/config";
import { check, fail } from "k6";
import { pipe } from "fp-ts/lib/function";
import { GenerateNonceResponse } from "./generated/definitions/fast-login/GenerateNonceResponse";
import exec from "k6/execution";
import * as E from "fp-ts/Either";
//@ts-ignore
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: "constant-arrival-rate",

      // How long the test lasts
      duration: "30s",

      // How many iterations per timeUnit
      rate: 60,
      /**
       * AzureDiagnostics
        | where backendPoolName_s == "appbackend-app-address-pool"
        | where requestUri_s != "/pagopa/api/v1/user" and requestUri_s != "/bpd/api/v1/user" and httpStatus_d != 404
        | summarize requests = count() by clientIP_s, bin(TimeGenerated, 15m)
        | summarize count() by clientIP_s
        | summarize sum(count_)
       */

      // Start `rate` iterations per second
      timeUnit: "1s",

      // Pre-allocate VUs
      preAllocatedVUs: 2,
    },
  },
};

const config = getConfigOrThrow();

export default function() {
  // Generate Nonce
  const response = http.post(
    `${config.IO_BACKEND_BASE_URL}/fast-login/nonce/generate`,
    undefined,
    { responseType: "text" }
  );
  check(response, {
    "GET Nonce returns 200": (r) => r.status === 200,
  });
  pipe(
    response.json(),
    GenerateNonceResponse.decode,
    E.map((_) => _.nonce),
    E.getOrElseW((_) => {
      console.error("Error decoding nonce");
      fail(readableReportSimplified(_));
    })
  );
  console.log(`${exec.vu.idInInstance}`);
  // Build sign request (local)
  // Refresh
  // Get Session
}

export function handleSummary(data: unknown) {
  return {
    "./out/summary.html": htmlReport(data),
  };
}
