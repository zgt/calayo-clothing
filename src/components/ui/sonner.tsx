"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      style={
        {
          "--normal-bg": "rgba(6, 95, 70, 0.95)", // emerald-800 with transparency
          "--normal-text": "rgb(255, 255, 255)",
          "--normal-border": "rgba(16, 185, 129, 0.3)", // emerald-500 with transparency
          "--success-bg": "rgba(16, 185, 129, 0.95)", // emerald-500
          "--success-text": "rgb(255, 255, 255)",
          "--success-border": "rgba(52, 211, 153, 0.5)", // emerald-400
          "--error-bg": "rgba(239, 68, 68, 0.95)", // red-500
          "--error-text": "rgb(255, 255, 255)",
          "--error-border": "rgba(248, 113, 113, 0.5)", // red-400
          "--warning-bg": "rgba(245, 158, 11, 0.95)", // amber-500
          "--warning-text": "rgb(255, 255, 255)",
          "--warning-border": "rgba(251, 191, 36, 0.5)", // amber-400
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "0.625rem", // matches your --radius
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
