import { PrismaClient } from "@prisma/client"
import { Application } from "express"
import hashPassword from "../hashPassword"
import authenticate from "../middleware/authenticate"
import authorize from "../middleware/authorize"
import validate from "../middleware/validate"
import parseResult from "../parseResult"
import getQuery from "../query"
import { userSanitize } from "../sanitizers"
import { RequestWithParams } from "../types/express"
import {
  emailValidator,
  firstNameValidator,
  idValidator,
  lastNameValidator,
  passwordValidator,
  queryValidator,
} from "../validators"

const makeRoutesUsers = (app: Application, prisma: PrismaClient) => {
  app.post(
    "/users",
    validate({
      body: {
        firstName: firstNameValidator,
        lastName: lastNameValidator,
        email: emailValidator,
        password: passwordValidator,
      },
    }),
    authenticate(),
    authorize("user", "create", true),
    async (req, res) => {
      const { firstName, lastName, email, password } = (
        req as RequestWithParams
      ).data.body

      const [passwordHash, passwordSalt] = hashPassword(password)

      const user = await prisma.user.create({
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
        select: userSanitize,
      })

      res.send(parseResult(user, req))

      return
    }
  )
  app.patch(
    "/users/:id",
    validate({
      body: {
        firstName: firstNameValidator.optional(),
        lastName: lastNameValidator.optional(),
        email: emailValidator.optional(),
      },
      params: { id: idValidator },
    }),
    authenticate(),
    authorize("user", "update", true),
    async (req, res) => {
      const {
        data: {
          body: { firstName, lastName, email },
          params: { id },
        },
      } = req as RequestWithParams

      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
        },
        select: userSanitize,
      })

      res.send(parseResult(updatedUser, req))

      return
    }
  )
  app.get(
    "/users",
    validate({ query: queryValidator }),
    authenticate(),
    authorize("user", "read"),
    async (req, res) => {
      const users = await prisma.user.findMany({
        ...getQuery(req),
        select: userSanitize,
      })

      res.send(parseResult(users, req))

      return
    }
  )

  app.get(
    "/users/:id",
    validate({ params: { id: idValidator } }),
    authenticate(),
    authorize("user", "read", true),
    async (req, res) => {
      const { id } = (req as RequestWithParams).data.params

      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        select: userSanitize,
      })

      if (!user) {
        return
      }

      res.send(parseResult(user, req))

      return
    }
  )
  app.delete(
    "/users/:id",
    validate({ params: { id: idValidator } }),
    authenticate(),
    authorize("user", "delete", true),
    async (req, res) => {
      const { id } = (req as RequestWithParams).data.params

      const deletedUser = await prisma.user.delete({
        where: {
          id,
        },
        select: userSanitize,
      })

      if (!deletedUser) {
        return
      }

      res.send(parseResult(deletedUser, req))

      return
    }
  )
}

export default makeRoutesUsers
