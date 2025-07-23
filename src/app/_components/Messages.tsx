import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "~/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "~/context/better-auth";
import type { Database } from "~/types/supabase";
import type {
  RealtimePostgresChangesPayload,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  user?: {
    name: string | null;
    email: string | null;
  };
};

type MessagePayload = RealtimePostgresChangesPayload<Message>;

interface MessagesComponentProps {
  commissionId: string;
  currentUserId?: string; // Made optional since we'll get it from auth context
  isAdmin?: boolean;
}

export default function MessagesComponent({
  commissionId,
  currentUserId,
  isAdmin = false,
}: MessagesComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { user } = useAuth();

  // Use auth context user ID if currentUserId not provided
  const userId = currentUserId ?? user?.id;

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          user:sender_id (
            name,
            email
          )
        `,
        )
        .eq("commission_id", commissionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data as Message[]);

      // Mark messages as read
      const unreadMessages = data?.filter(
        (msg: Message) => !msg.read && msg.sender_id !== userId,
      );

      if (unreadMessages?.length) {
        await Promise.all(
          unreadMessages.map((msg: Message) =>
            supabase.from("messages").update({ read: true }).eq("id", msg.id),
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [commissionId, userId, supabase]);

  // Subscribe to new messages
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`commission_${commissionId}`)
      .on(
        "postgres_changes" as const,
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `commission_id=eq.${commissionId}`,
        },
        (payload: MessagePayload) => {
          console.log("payload", payload);
          // Only fetch the new message if it wasn't sent by the current user
          const newMessage = payload.new as Message;
          if (newMessage.sender_id !== userId) {
            void (async () => {
              try {
                const response = await supabase
                  .from("messages")
                  .select(
                    `
                    *,
                    user:sender_id (
                      name,
                      email
                    )
                  `,
                  )
                  .eq("id", newMessage.id)
                  .single();

                if (response.error) {
                  console.error("Error fetching new message:", response.error);
                  return;
                }

                if (response.data) {
                  const typedData = response.data as Message;
                  setMessages((prev) => [...prev, typedData]);
                  // Mark message as read
                  void supabase
                    .from("messages")
                    .update({ read: true })
                    .eq("id", typedData.id);
                }
              } catch (error) {
                console.error("Error in message subscription handler:", error);
              }
            })();
          }
        },
      )
      .subscribe();

    void fetchMessages();

    return () => {
      void subscription.unsubscribe();
    };
  }, [commissionId, userId, fetchMessages, supabase]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom();
    }
  }, [isLoading, messages.length]);

  // Send message
  const handleSendMessage = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending || !userId) return;

    setIsSending(true);

    try {
      const { data, error }: PostgrestSingleResponse<Message> = await supabase
        .from("messages")
        .insert({
          id: crypto.randomUUID(),
          commission_id: commissionId,
          sender_id: userId,
          content: newMessage.trim(),
        })
        .select(
          `
          *,
          user:sender_id (
            name,
            email
          )
        `,
        )
        .single();

      if (error) throw error;

      // Update local messages state
      if (data) {
        setMessages((prev) => [...prev, data]);
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div className="flex h-[500px] flex-col rounded-lg border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 shadow-2xl backdrop-blur-sm">
      {/* Messages Header */}
      <div className="border-b border-emerald-700/30 px-4 py-3">
        <h3 className="text-lg font-medium text-white">Messages</h3>
        <p className="text-sm text-emerald-200/70">
          {isAdmin
            ? "Support conversation with customer"
            : "Conversation with designer"}
        </p>
      </div>

      {/* Messages List */}
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-emerald-200/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2 h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender_id === userId
                      ? "bg-emerald-600/40 text-white"
                      : "bg-emerald-900/40 text-emerald-100"
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-emerald-300/80">
                      {message.sender_id === userId
                        ? "You"
                        : (message.user?.name ?? "Calayo Clothing")}
                    </span>
                    <span className="text-xs text-emerald-300/50">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-emerald-700/30 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-emerald-700/30 bg-emerald-950/50 px-4 py-2 text-white placeholder:text-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? (
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
