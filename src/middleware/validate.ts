import { z, ZodRawShape } from "zod"
import { InvalidArgumentError } from "../errors"
import mw from "./mw"

type ValidatorKey = "body" | "params" | "query"

type Validator = Partial<Record<ValidatorKey, ZodRawShape>>

const validatorKeys: ValidatorKey[] = ["body", "params", "query"]

const validate = (validators: Validator) =>
  mw(async (req, res, next) => {
    const { body, params, query } = validators

    try {
      validatorKeys.forEach((key) => {
        if (validators[key] && !req[key]) {
          throw new Error(`Missing req.${key}`)
        }
      })

      //@ts-ignore
      req.data = z
        .object({
          ...(body ? { body: z.object(body) } : {}),
          ...(query ? { query: z.object(query) } : {}),
          ...(params ? { params: z.object(params) } : {}),
        })
        .parse({
          params: req.params,
          body: req.body,
          query: req.query,
        })

      next()
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new InvalidArgumentError(err.errors.map((err) => err.message))
      }

      throw err
    }
  })

export default validate
