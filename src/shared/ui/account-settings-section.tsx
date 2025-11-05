'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './card'
import { Input } from './input'
import { Label } from './label'
import { Button } from './button'
import { Separator } from './separator'
import { AlertCircle } from 'lucide-react'

interface AccountSettingsSectionProps {
  currentEmail?: string
  onChangeEmail: (newEmail: string) => Promise<void>
  onChangePassword: (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => Promise<void>
  onDeleteAccount: () => void
}

export function AccountSettingsSection({
  currentEmail,
  onChangeEmail,
  onChangePassword,
  onDeleteAccount,
}: AccountSettingsSectionProps) {
  const [newEmail, setNewEmail] = useState('')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newEmail && newEmail !== currentEmail) {
      await onChangeEmail(newEmail)
      setNewEmail('')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    await onChangePassword(passwordData)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  return (
    <div className="space-y-6">
      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle>Changer d'email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <Label htmlFor="currentEmail">Email actuel</Label>
              <Input
                id="currentEmail"
                type="email"
                value={currentEmail || ''}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div>
              <Label htmlFor="newEmail">Nouvel email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouveau@email.com"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!newEmail || newEmail === currentEmail}>
                Changer l'email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Changer de mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                placeholder="Mot de passe actuel"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                placeholder="Nouveau mot de passe"
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 8 caractères avec majuscule, minuscule et chiffre
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                placeholder="Confirmez le mot de passe"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
              >
                Changer le mot de passe
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zone de danger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 text-sm">
                  Supprimer le compte
                </h4>
                <p className="text-sm text-red-800 mt-1">
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="destructive" onClick={onDeleteAccount}>
                Supprimer mon compte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
