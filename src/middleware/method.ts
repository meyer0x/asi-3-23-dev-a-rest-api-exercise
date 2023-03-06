import { MethodNotAllowedError } from "../errors"
import mw from "./mw"

type HTTPMethod = "GET" | "POST" | "DELETE" | "PUT"

const methodsAllowed = (methods: HTTPMethod[]) =>
  mw(async (req, _res, next) => {
    const { method } = req

    const isAllowed = methods.includes(method as HTTPMethod)

    if (isAllowed) {
      next()
      return
    }

    throw new MethodNotAllowedError()
  })

export default methodsAllowed
