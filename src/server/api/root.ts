import { commissionsRouter } from "~/server/api/routers/commissions";
import { instagramRouter } from "~/server/api/routers/instagram";
import { messagesRouter } from "~/server/api/routers/messages";
import { profileRouter } from "~/server/api/routers/profile";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  commissions: commissionsRouter,
  instagram: instagramRouter,
  messages: messagesRouter,
  profile: profileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.commissions.getUserCommissions();
 */
export const createCaller = createCallerFactory(appRouter);
