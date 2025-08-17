'use client'

import { useEffect, useState } from 'react';
import { apiService, convertKeysToCamel } from '@/services/api-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import ZoomableImage from '@/components/ZoomableImage';

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
}

interface Intervention {
  id: number
  veloCategorie: string
  veloElectrique: boolean
  veloMarque: string
  veloModele: string
  adresse: string
  commentaireClient: string
  photo: string | null
  typeIntervention: {
    nom: string
    duree: string
    prixDepart: string
  }
  technicien: {
    first_name: string
    last_name: string
  }
  debut: string
  fin: string
  client: User
}

export default function MonProfilPage() {
  const [user, setUser] = useState<User | null>(null)
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des interventions
        const response = await apiService('interventions/client', 'GET', undefined, true)
        setInterventions(convertKeysToCamel(response))

        // Récupération des infos de l'utilisateur connecté
        const userInfo = await apiService('users/me', 'GET', undefined, true)
        setUser(convertKeysToCamel(userInfo))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const now = new Date()
  const futures = interventions.filter(i => new Date(i.debut) > now)
  const passees = interventions.filter(i => new Date(i.debut) <= now)

  const renderIntervention = (intervention: Intervention) => (
    <AccordionItem key={intervention.id} value={`intervention-${intervention.id}`}>
      <AccordionTrigger>
        <div className="text-left w-full">
          <p className="font-medium">{intervention.typeIntervention.nom} – {new Date(intervention.debut).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{intervention.adresse}</p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Card>
          <CardContent className="p-4 space-y-2">
            <p><strong>Vélo :</strong> {intervention.veloMarque} {intervention.veloModele} {intervention.veloCategorie} {intervention.veloElectrique ? '⚡' : ''}</p>
            <p><strong>Prix :</strong> {intervention.typeIntervention.prixDepart} €</p>
            <p><strong>Durée :</strong> {new Date(intervention.typeIntervention.duree).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Commentaire :</strong> {intervention.commentaireClient}</p>
            {intervention.photo && (
              <ZoomableImage
                src={`${process.env.NEXT_PUBLIC_UPLOAD_DIR}/${intervention.photo}`}
                alt="Photo du vélo"
                className="max-w-xs rounded-md cursor-zoom-in"
              />
            )}

          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  )

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-10">
      {/* Section Mon profil */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Mon profil</h1>
        <Card>
          <CardContent className="p-6 space-y-2">
            {user ? (
              <>
                <p><strong>Nom :</strong> {user.lastName}</p>
                <p><strong>Prénom :</strong> {user.firstName}</p>
                <p><strong>Email :</strong> {user.email}</p>
                {user.phoneNumber && (
                  <p><strong>Téléphone :</strong> {user.phoneNumber}</p>
                )}
              </>
            ) : (
              <p>Chargement des informations utilisateur…</p>
            )}
          </CardContent>

        </Card>
      </section>

      {/* Section Mes interventions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Mes demandes d’intervention</h2>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <Tabs defaultValue="futures" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="futures">À venir</TabsTrigger>
              <TabsTrigger value="passees">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="futures">
              {futures.length ? (
                <Accordion type="multiple" className="space-y-2">
                  {futures.map(renderIntervention)}
                </Accordion>
              ) : <p>Aucune intervention à venir.</p>}
            </TabsContent>

            <TabsContent value="passees">
              {passees.length ? (
                <Accordion type="multiple" className="space-y-2">
                  {passees.map(renderIntervention)}
                </Accordion>
              ) : <p>Aucune intervention passée.</p>}
            </TabsContent>
          </Tabs>
        )}
      </section>
    </div>
  )
}
