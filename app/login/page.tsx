'use client'

import { useState } from "react";
import { useCookies } from "react-cookie";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/schemas/schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GalleryVerticalEnd } from "lucide-react";
import { apiService } from "@/services/api-service";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME ?? 'hch_token_u';
  const [, setCookie] = useCookies([TOKEN_NAME]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true)
    setErrorMessage(null)

    try {
      const data = await apiService(
        "login_check",
        "POST",
        {
          username: values.email,
          password: values.password,
        },
        false
      )

      const token = data?.token
      if (!token) throw new Error("Le token n'a pas été renvoyé.")

      setCookie(TOKEN_NAME, token, {
        path: "/",
        maxAge: 3600, // 1h
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })

    // Pas de router.push pour recharger la navbar
    window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error)
      setErrorMessage(
        "Identifiants incorrects. Veuillez vérifier votre email et votre mot de passe."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          HomeCyclHome
        </a>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>
              Connectez-vous avec vos identifiants HomeCyclHome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="exemple@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mot de passe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {errorMessage && (
                  <div className="text-sm text-red-500">{errorMessage}</div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Chargement..." : "Connexion"}
                </Button>

                <div className="text-center text-sm">
                  Pas encore de compte ?{" "}
                  <a href="/register" className="underline">
                    Inscription
                  </a>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="text-center text-xs text-muted-foreground">
          En vous connectant, vous acceptez nos{" "}
          <a href="#" className="underline hover:text-primary">
            Conditions d&apos;utilisation
          </a>{" "}
          et notre{" "}
          <a href="#" className="underline hover:text-primary">
            Politique de confidentialité
          </a>
          .
        </div>
      </div>
    </div>
  )
}
