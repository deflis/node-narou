import { URL as nodeURL } from "url";
let windowURL = null;
if (typeof window !== "undefined") {
  windowURL = window.URL;
}

export default windowURL ?? nodeURL;
