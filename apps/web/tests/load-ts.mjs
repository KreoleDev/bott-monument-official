import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
export function loadTs(
  file,
  {
    env = {},
    fetch = () => {
      throw new Error("Unexpected fetch");
    },
  } = {},
) {
  const modules = new Map();
  const context = vm.createContext({
    process: { env },
    fetch,
    AbortSignal,
    Buffer,
    URL,
    console: { warn() {} },
    Map,
  });
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    const loadedModule = { exports: {} };
    modules.set(filename, loadedModule);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const localRequire = (id) =>
      id === "next/cache"
        ? { unstable_cache: (fn) => fn }
        : id.startsWith(".")
          ? load(path.resolve(path.dirname(filename), id + ".ts"))
          : require(id);
    const fn = vm.runInContext(`(function(require,module,exports){${source}\n})`, context);
    fn(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return load(new URL(file, import.meta.url).pathname);
}
