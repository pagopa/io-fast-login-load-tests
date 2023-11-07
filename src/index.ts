import http from "k6/http";
import { getConfigOrThrow } from "./utils/config";

export const options = {
  iterations: 1,
};

const config = getConfigOrThrow();

export default function () {
  const response = http.get("https://test-api.k6.io/public/crocodiles/");
}
