import moduleAlias from "module-alias";
import { resolve } from "node:path";

moduleAlias.addAlias("@", resolve(__dirname));