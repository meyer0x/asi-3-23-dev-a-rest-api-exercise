import { PrismaClient } from "@prisma/client"
import cors from "cors"
import express from "express"
import morgan from "morgan"
import { AppConfig } from "./config"
import handleError from "./middleware/handleError"
import makeRoutesPages from "./routes/makeRoutesPages"
import makeRoutesSign from "./routes/makeRoutesSign"
import makeRoutesUsers from "./routes/makeRoutesUsers"

const run = async (config: AppConfig) => {
  const { port } = config
  const app = express()

  const prisma = new PrismaClient()

  app.use(cors())
  app.use(express.json())

  app.use(morgan("dev"))

  makeRoutesSign(app, prisma)
  makeRoutesUsers(app, prisma)
  makeRoutesPages(app, prisma)

  app.use(handleError)

  app.use((req, res) => {
    res.status(404).send({ error: [`cannot ${req.method} ${req.url}`] })
  })

  app.listen(port, () => console.log(`Listening on :${port}`))
}

export default run
