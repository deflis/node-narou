import { search } from "narou"

async function main() {
  console.log(await search("ハーレム").execute())
}

main()