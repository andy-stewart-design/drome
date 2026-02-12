import { z } from 'zod'

const userSchema = z.object({
  name: z.string(),
  id: z.string(),
})

type DromeUser = z.infer<typeof userSchema>

export { userSchema, type DromeUser }
