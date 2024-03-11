import { Hono } from "hono";
import { verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import {
  createPostInput,
  updatePostInput,
} from "@akemnoorsingh/medium-project";

export const bookRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

bookRouter.use("/*", async (c, next) => {
  const jwt = c.req.header("Authorization");
  if (!jwt) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }

  const token = jwt.split(" ")[1];
  const payload = await verify(token, c.env.JWT_SECRET);

  if (!payload) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  c.set("userId", payload.id);
  await next();
});

bookRouter.use("/*", async (c, next) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  c.set("jwtPayload", prisma);

  await next();
});

//initializing blog/post
bookRouter.post("/newblog", async (c) => {
  const userId = c.get("userId");

  const body = await c.req.json();
  const { success } = createPostInput.safeParse(body);
  if (!success) {
    c.status(403);
    return c.json({ error: "invalid input" });
  }
  try {
    const prisma = c.get("jwtPayload") as PrismaClient;
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
    return c.json({ id: post.id });
  } catch (e) {
    console.log(e);
    c.status(403);
    return c.json({ error: "error while creating post" });
  }
});

//to updateblog
bookRouter.put("/editblog", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const { id } = body;
  const { success } = updatePostInput.safeParse(body);
  const prisma = c.get("jwtPayload") as PrismaClient;

  if (!id || typeof id !== "string") {
    c.status(400);
    return c.json({ error: "Invalid or missing post ID" });
  }

  if (!success) {
    c.status(400);
    return c.json({ error: "invalid input" });
  }
  const postExists = await prisma.post.findFirst({
    where: {
      id,
      authorId: userId,
    },
  });
  if (!postExists) {
    c.status(403);
    return c.json({ error: "post not found" });
  }
  const post = await prisma.post.update({
    where: {
      id: id,
      authorId: userId,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });
  return c.json({ message: "updated" });
});

//to get specific blog
bookRouter.get("/blog/:id", async (c) => {
  const userId = c.get("userId");
  const prisma = c.get("jwtPayload") as PrismaClient;
  const id = c.req.param("id");
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });
  return c.json(post);
});

// to get all blogs
bookRouter.get("/blog", async (c) => {
  const prisma = c.get("jwtPayload") as PrismaClient;

  const blogs = await prisma.post.findMany({
    select: {
      content: true,
      title: true,
      id: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });
  return c.json(blogs);
});

//publishing the blog
bookRouter.put("/publish/:id", async (c) => {
  const userId = c.get("userId");
  const prisma = c.get("jwtPayload") as PrismaClient;
  const id = c.req.param("id");
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
  });
  if (post?.authorId !== userId) {
    c.status(403);
    return c.json({ error: "unauthorized" });
  }
  const update = await prisma.post.update({
    where: {
      id,
    },
    data: {
      published: true,
    },
  });
  return c.json({ message: "published" });
});
export default bookRouter;
