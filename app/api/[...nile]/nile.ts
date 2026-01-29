import { Nile, type Extension } from "@niledatabase/server";
import { nextJs } from "@niledatabase/nextjs";

const nile = await Nile({
  debug: true,
  extensions: [nextJs as Extension],
});

export { nile };
