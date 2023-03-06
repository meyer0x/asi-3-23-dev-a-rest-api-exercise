import config from "./src/config"
import run from "./src/run"

async function main(): Promise<void> {
  if (config) {
    await run(config)
  }
}

main()
