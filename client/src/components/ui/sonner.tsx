"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group [&>*]:z-[40] [&_button]:pointer-events-auto"
      position="bottom-center"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        style: {
          pointerEvents: 'auto',
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg animate-in slide-in-from-bottom-5 duration-300 max-w-lg w-auto break-words whitespace-normal pointer-events-auto",
          description: "group-[.toast]:text-muted-foreground whitespace-normal break-words text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground pointer-events-auto",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground pointer-events-auto hover:opacity-80 transition-opacity cursor-pointer",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
