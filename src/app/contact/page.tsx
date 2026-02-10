"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { CharacterProgress } from "@/components/ui/character-progress"

const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must be less than 50 characters." }),
  email: z.string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
  subject: z.string()
    .min(5, { message: "Subject must be at least 5 characters." })
    .max(100, { message: "Subject must be less than 100 characters." }),
  message: z.string()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(1000, { message: "Message must be less than 1000 characters." }),
})

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const { formState: { errors, dirtyFields, isSubmitted } } = form;

  // Helper to get field validation state
  const getFieldState = (fieldName: keyof z.infer<typeof formSchema>) => {
    const isDirty = dirtyFields[fieldName];
    const hasError = !!errors[fieldName];
    // Show error state if field is dirty with error, OR if form was submitted with error
    if (!isDirty && !isSubmitted) return "idle";
    if (hasError) return "error";
    return isDirty ? "success" : "idle";
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const toastId = toast.loading("Sending message...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send message", { id: toastId });
        return;
      }

      toast.success("Message sent successfully!", { id: toastId });
      form.reset();
    } catch (error) {
      toast.error("Something went wrong. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  // Input styling based on validation state
  const getInputClassName = (state: "idle" | "error" | "success") => {
    return cn(
      "transition-all duration-200",
      state === "success" && "border-green-500/50 focus-visible:ring-green-500/20",
      state === "error" && "border-destructive/50 focus-visible:ring-destructive/20"
    );
  };

  return (
    <div className="flex flex-col gap-10 max-w-2xl mx-auto">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Contact Protocol</h1>
        <p className="text-xl text-muted-foreground">
          Initialize a handshake with the system.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <div className="order-2 md:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                I usually respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => {
                      const state = getFieldState("name");
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Name
                            {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="John Doe"
                                className={getInputClassName(state)}
                                {...field}
                              />
                              {state === "error" && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => {
                      const state = getFieldState("email");
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Email
                            {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                className={getInputClassName(state)}
                                {...field}
                              />
                              {state === "error" && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => {
                      const state = getFieldState("subject");
                      const charCount = field.value?.length || 0;
                      return (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="flex items-center gap-2">
                              Subject
                              {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                            </FormLabel>
                            <span className={cn(
                              "text-xs transition-colors",
                              charCount === 0 ? "text-muted-foreground" :
                                charCount < 5 ? "text-orange-500" :
                                  charCount > 100 ? "text-destructive" : "text-green-500"
                            )}>
                              {charCount}/100
                            </span>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Project collaboration..."
                                className={getInputClassName(state)}
                                maxLength={100}
                                {...field}
                              />
                              {state === "error" && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                              )}
                            </div>
                          </FormControl>
                          <CharacterProgress current={charCount} min={5} max={100} />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => {
                      const state = getFieldState("message");
                      const charCount = field.value?.length || 0;
                      return (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="flex items-center gap-2">
                              Message
                              {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                            </FormLabel>
                            <span className={cn(
                              "text-xs transition-colors",
                              charCount === 0 ? "text-muted-foreground" :
                                charCount < 10 ? "text-orange-500" :
                                  charCount > 1000 ? "text-destructive" : "text-green-500"
                            )}>
                              {charCount}/1000
                            </span>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Tell me about your project..."
                              className={cn("min-h-[120px] resize-none", getInputClassName(state))}
                              maxLength={1000}
                              {...field}
                            />
                          </FormControl>
                          <CharacterProgress current={charCount} min={10} max={1000} />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                  <Button
                    type="submit"
                    className="w-full transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="order-1 md:order-2 grid gap-4 md:grid-cols-2 text-center">
          <div className="flex flex-col items-center gap-2 p-4 border rounded-xl bg-muted/50">
            <Mail className="h-6 w-6 text-primary" />
            <div className="font-semibold">Email</div>
            <a href="mailto:mianmubeen205@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              mtayyabsohail8@gmail.com
            </a>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-xl bg-muted/50">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div className="font-semibold">WhatsApp</div>
            <a href="https://wa.me/923091165807" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              +92 309 1165807
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
