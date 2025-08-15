'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCookies } from 'react-cookie'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { userRegisterSchema } from '@/schemas/schemas'
import { GalleryVerticalEnd } from 'lucide-react'
import { apiService } from '@/services/api-service'
import { PhoneInput } from '@/components/PhoneInput'

export default function RegisterPage() {
  const router = useRouter()
  const [, setCookie] = useCookies(['token'])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof userRegisterSchema>>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      phoneNumber: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof userRegisterSchema>) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const data = await apiService('register', 'POST', values, false)
      const token = data?.token
      if (!token) throw new Error("Le token n'a pas été renvoyé par l'API.")
      setCookie('token', token, {
        path: '/',
        maxAge: 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })

      router.push('/')
    } catch (error) {
      console.error(error)
      setErrorMessage("Une erreur est survenue lors de l'inscription.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          HomeCyclHome
        </a>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Création de compte</CardTitle>
            <CardDescription>Inscrivez-vous avec vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="firstname">Prénom</Label>
                <Input id="firstname" {...form.register('firstname')} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastname">Nom</Label>
                <Input id="lastname" {...form.register('lastname')} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" {...form.register('email')} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                <Controller
                  name="phoneNumber"
                  control={form.control}
                  render={({ field }) => (
                    <PhoneInput
                      id="phoneNumber"
                      placeholder="+33 6 12 34 56 78"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input type="password" id="password" {...form.register('password')} required />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Chargement...' : "S'inscrire"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm">
          Déjà un compte ?{' '}
          <a href="/login" className="underline underline-offset-4">
            Connexion
          </a>
        </div>
      </div>
    </div>
  )
}
