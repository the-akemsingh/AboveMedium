import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { Hono } from "hono";
import { signinInput, signupInput } from "@akemnoorsingh/medium-project";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.use("/*", async (c, next) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  c.set("jwtPayload", prisma);

  await next();
});

userRouter.post("/signup", async (c) => {
  const prisma = c.get("jwtPayload") as PrismaClient;
  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
  if (!success) {
    return c.json({ error: "invalid input"});
  }
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (existingUser) {
      return c.json({ error: "user already exists" });
    }
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    console.log("sign up successfull");
    return c.json({ token });
  } catch (e) {
    c.status(403);
    return c.json({ error: "error while signing up" });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = c.get("jwtPayload") as PrismaClient;

  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);
  if (!success) {
    return c.json({ error: "invalid input" });
  }
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
    },
  });

  if (!user) {
    c.status(403);
    return c.json({ error: "user not found" });
  }

  const token = await sign({ id: user.id }, c.env.JWT_SECRET);
  return c.json({ token });
});
