import jsonwebtoken from "jsonwebtoken"
import config from "../config"
import { InvalidSessionError } from "../errors"
import mw from "./mw"

const authenticate = (optional?: boolean) =>
  mw(async (req, _res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
      if (optional) {
        next()
        return
      }
      throw new InvalidSessionError()
    }

    try {
      //@ts-ignore
      const { user } = jsonwebtoken.verify(
        authorization.slice(7),
        config?.security.session.jwt.secret as string
      )

      //@ts-ignore
      req.session = user
    } catch (err) {
      if (err instanceof jsonwebtoken.JsonWebTokenError) {
        throw new InvalidSessionError()
      }

      throw err
    }

    next()
  })

export default authenticate
