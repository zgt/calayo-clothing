import { postRouter } from "~/server/api/routers/post";
import { commissionsRouter } from "~/server/api/routers/commissions";
import { instagramRouter } from "~/server/api/routers/instagram";
import { profileRouter } from "~/server/api/routers/profile";
import { jobsRouter } from "~/server/api/routers/jobs";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  commissions: commissionsRouter,
  instagram: instagramRouter,
  profile: profileRouter,
  jobs: jobsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
