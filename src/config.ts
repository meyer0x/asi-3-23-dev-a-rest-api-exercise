import "dotenv/config"
import { z } from "zod"

const validationConfigSchema = z.object({
  port: z.preprocess(
    (arg) => parseInt(arg as string),
    z.number().min(80).max(65535)
  ),
  security: z.object({
    session: z.object({
      password: z.object({
        saltlen: z.number(),
        iterations: z.number(),
        keylen: z.number(),
        digest: z.enum(["sha512"]),
      }),
      jwt: z.object({
        secret: z.string().min(30),
      }),
    }),
  }),
})

export type AppConfig = z.TypeOf<typeof validationConfigSchema>

let config: AppConfig | null = null

try {
  config = validationConfigSchema.parse({
    port: process.env.PORT,
    security: {
      session: {
        jwt: {
          secret: process.env.SECURITY_SESSION_JWT_SECRET,
          expiresIn: "1 day",
        },
        password: {
          saltlen: 32,
          iterations: 123943,
          keylen: 256,
          digest: "sha512",
        },
      },
    },
  })
} catch (err: any) {
  console.log(err)
  // eslint-disable-next-line no-console
  throw new Error(`Invalid config.

- ${err.errors.join("\n- ")}

`)
}

export default config
