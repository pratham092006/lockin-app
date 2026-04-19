import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white/5 group-[.toaster]:text-[#F8F9FA] group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl rounded-[16px]",
          description: "group-[.toast]:text-white/50",
          actionButton: "group-[.toast]:bg-[#CCFF00] group-[.toast]:text-[#121212] group-[.toast]:font-bold",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white",
          success: "group-[.toast]:text-[#CCFF00] group-[.toast]:border-[#CCFF00]/20",
          error: "group-[.toast]:text-[#FF4D4D] group-[.toast]:border-[#FF4D4D]/20",
          info: "group-[.toast]:text-[#00FFFF] group-[.toast]:border-[#00FFFF]/20",
        },
      }}
    />
  );
}
