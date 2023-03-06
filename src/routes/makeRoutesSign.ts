import { PrismaClient } from "@prisma/client"
import { Application } from "express"
import * as jwt from "jsonwebtoken"
import config from "../config"
import { InvalidCredentialsError } from "../errors"
import hashPassword from "../hashPassword"
import validate from "../middleware/validate"
import {
  emailValidator,
  firstNameValidator,
  lastNameValidator,
  passwordValidator,
} from "../validators"

const makeRoutesSign = (app: Application, db: PrismaClient) => {
  app.post(
    "/sign-up",
    validate({
      body: {
        firstName: firstNameValidator,
        lastName: lastNameValidator,
        email: emailValidator,
        password: passwordValidator,
      },
    }),
    async (req, res) => {
      //@ts-ignore
      const { firstName, lastName, email, password } = req.data.body

      const [passwordHash, passwordSalt] = hashPassword(password)

      const user = await db.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          passwordSalt,
          role: {
            connect: {
              name: "editor",
            },
          },
        },
        select: { id: true },
      })

      return res.send({ result: user })
    }
  )
  app.post(
    "/sign-in",
    validate({
      body: {
        email: emailValidator,
        password: passwordValidator,
      },
    }),
    async (req, res) => {
      //@ts-ignore
      const { email, password } = req.data.body

      const user = await db.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new InvalidCredentialsError()
      }

      const [passwordHash] = hashPassword(password, user.passwordSalt)

      if (user.passwordHash !== passwordHash) {
        throw new InvalidCredentialsError()
      }

      const jwtToken = jwt.sign(
        { user: { id: user.id } },
        config?.security.session.jwt.secret as string
      )

      res.send({ result: jwtToken })
    }
  )
}

export default makeRoutesSign
