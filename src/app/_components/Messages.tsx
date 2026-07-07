import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "~/lib/auth-client";
import { api, type RouterOutputs } from "~/trpc/react";

type Message = RouterOutputs["messages"]["list"][number];

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
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const user = session?.user;

  // Use auth context user ID if currentUserId not provided
  const userId = currentUserId ?? user?.id;

  const utils = api.useUtils();

  // Polling replaces the previous realtime subscription; React Query pauses
  // refetching while the tab is hidden.
  const messagesQuery = api.messages.list.useQuery(
    { commissionId },
    { enabled: !!userId, refetchInterval: 5000 },
  );
  const messages = messagesQuery.data ?? [];
  const isLoading = messagesQuery.isLoading;

  const sendMutation = api.messages.send.useMutation({
    onSuccess: (message) => {
      // Instant echo for the sender; the next poll reconciles.
      utils.messages.list.setData({ commissionId }, (prev) =>
        prev ? [...prev, message] : [message],
      );
      setNewMessage("");
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });
  const isSending = sendMutation.isPending;

  const markReadMutation = api.messages.markRead.useMutation({
    onSuccess: () => {
      // Refresh the read flags so the effect below stops re-firing.
      void utils.messages.list.invalidate({ commissionId });
    },
  });

  // Mark the other party's messages read whenever unread ones are on screen.
  const hasUnreadFromOthers = messages.some(
    (message) => !message.read && message.sender_id !== userId,
  );
  const isMarkingRead = markReadMutation.isPending;
  useEffect(() => {
    if (!userId || !hasUnreadFromOthers || isMarkingRead) return;
    markReadMutation.mutate({ commissionId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, hasUnreadFromOthers, isMarkingRead, commissionId]);

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

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom();
    }
  }, [isLoading, messages.length]);

  // Send message
  const handleSendMessage = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending || !userId) return;

    sendMutation.mutate({ commissionId, content: newMessage.trim() });
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.MouseEvent);
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
            {messages.map((message: Message) => (
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
