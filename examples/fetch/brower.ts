import { search } from "narou/browser"

async function main() {
  console.log(await search("ハーレム").execute())
}

main()