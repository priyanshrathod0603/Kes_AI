'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { User, Mail, Calendar, Award, Settings, Camera, Edit2, Save, X } from 'lucide-react'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [userData, setUserData] = useState({
    fullName: 'Student',
    email: 'student@kesh.ai',
    avatar: undefined,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: userData.fullName,
      email: userData.email,
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setUserData({ ...data, avatar: userData.avatar })
    setIsEditing(false)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setAvatarPreview(null)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6 animate-in max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-foreground-muted">Manage your personal information</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <div className="relative">
              <Avatar
                src={avatarPreview || userData.avatar}
                fallback={userData.fullName || 'User'}
                size="2xl"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors">
                    <Camera className="h-5 w-5" />
                  </div>
                </label>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{userData.fullName || 'Student'}</h2>
              <p className="text-foreground-muted mt-1">{userData.email || 'student@school.edu'}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  Student
                </Badge>
              </div>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button type="submit" form="profile-form" loading={isSubmitting}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Profile
              </Button>
            )}
          </div>

          <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Separator className="my-6" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  disabled={!isEditing}
                  error={errors.fullName?.message}
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!isEditing}
                  error={errors.email?.message}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 mx-auto mb-4">
            <Calendar className="h-7 w-7 text-primary-600" />
          </div>
          <h3 className="font-semibold text-foreground">Member Since</h3>
          <p className="text-2xl font-bold text-foreground mt-2 text-primary-600">January 2024</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-100 mx-auto mb-4">
            <Award className="h-7 w-7 text-success-600" />
          </div>
          <h3 className="font-semibold text-foreground">Achievements</h3>
          <p className="text-2xl font-bold text-foreground mt-2 text-success-600">12</p>
          <p className="text-foreground-muted text-sm mt-1">Badges earned</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 mx-auto mb-4">
            <Settings className="h-7 w-7 text-violet-600" />
          </div>
          <h3 className="font-semibold text-foreground">Study Hours</h3>
          <p className="text-2xl font-bold text-foreground mt-2 text-violet-600">48h</p>
          <p className="text-foreground-muted text-sm mt-1">This month</p>
        </Card>
      </motion.div>
    </div>
  )
}