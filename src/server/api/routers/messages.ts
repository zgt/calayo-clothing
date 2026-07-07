import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { User } from "~/lib/auth";

const MESSAGE_EMBED = `
  *,
  user:sender_id (
    name,
    email
  )
`;

export interface ChatMessage {
  id: string;
  commission_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  user?: {
    name: string | null;
    email: string | null;
  } | null;
}

// The commission chat is owner-or-admin only. Reported as NOT_FOUND either way
// so non-owners can't probe which commission ids exist.
async function assertCommissionAccess(
  supabase: SupabaseClient,
  commissionId: string,
  user: User,
) {
  const { data: commission, error } = (await supabase
    .from("commissions")
    .select("id, user_id")
    .eq("id", commissionId)
    .single()) as { data: { id: string; user_id: string } | null; error: any };

  if (error || !commission) {
    if (error && error.code !== "PGRST116") {
      console.error("Error verifying commission access:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load messages",
      });
    }
    throw new TRPCError({ code: "NOT_FOUND", message: "Commission not found" });
  }

  if (user.role !== "admin" && commission.user_id !== user.id) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Commission not found" });
  }
}

export const messagesRouter = createTRPCRouter({
  // Get all messages for a commission (owner or admin only)
  list: protectedProcedure
    .input(
      z.object({ commissionId: z.string().min(1, "Commission ID is required") }),
    )
    .query(async ({ input, ctx }) => {
      const { supabase } = ctx;
      const user = ctx.user as User;

      await assertCommissionAccess(supabase, input.commissionId, user);

      const { data: messages, error } = (await supabase
        .from("messages")
        .select(MESSAGE_EMBED)
        .eq("commission_id", input.commissionId)
        .order("created_at", { ascending: true })) as {
        data: ChatMessage[] | null;
        error: any;
      };

      if (error) {
        console.error("Error fetching messages:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load messages",
        });
      }

      return messages ?? [];
    }),

  // Send a message in a commission thread. sender_id always comes from the
  // session, never from the client.
  send: protectedProcedure
    .input(
      z.object({
        commissionId: z.string().min(1, "Commission ID is required"),
        content: z.string().trim().min(1, "Message is required").max(2000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { supabase } = ctx;
      const user = ctx.user as User;

      await assertCommissionAccess(supabase, input.commissionId, user);

      const { data: message, error } = (await supabase
        .from("messages")
        .insert({
          id: crypto.randomUUID(),
          commission_id: input.commissionId,
          sender_id: user.id,
          content: input.content,
        })
        .select(MESSAGE_EMBED)
        .single()) as { data: ChatMessage | null; error: any };

      if (error || !message) {
        console.error("Error sending message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
      }

      return message;
    }),

  // Mark every message from the other party as read.
  markRead: protectedProcedure
    .input(
      z.object({ commissionId: z.string().min(1, "Commission ID is required") }),
    )
    .mutation(async ({ input, ctx }) => {
      const { supabase } = ctx;
      const user = ctx.user as User;

      await assertCommissionAccess(supabase, input.commissionId, user);

      const { error } = (await supabase
        .from("messages")
        .update({ read: true })
        .eq("commission_id", input.commissionId)
        .neq("sender_id", user.id)
        .eq("read", false)) as { error: any };

      if (error) {
        console.error("Error marking messages read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update messages",
        });
      }

      return { success: true };
    }),
});
