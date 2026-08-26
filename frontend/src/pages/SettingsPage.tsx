'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Bell, Moon, Sun, Shield, Palette, Key, Trash2, Save, Loader2 } from 'lucide-react'

const notificationSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  quizReminders: z.boolean(),
  studyReminders: z.boolean(),
  aiUpdates: z.boolean(),
})

const appearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.enum(['small', 'medium', 'large']),
  reducedMotion: z.boolean(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').max(12, 'Password must be at most 12 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type NotificationFormData = z.infer<typeof notificationSchema>
type AppearanceFormData = z.infer<typeof appearanceSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'appearance' | 'privacy' | 'security' | 'account'>('notifications')
  const [isSaving, setIsSaving] = useState(false)

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email: true,
      push: true,
      quizReminders: true,
      studyReminders: true,
      aiUpdates: false,
    },
  })

  const appearanceForm = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      theme: 'system',
      fontSize: 'medium',
      reducedMotion: false,
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const handleNotificationSave = async (data: NotificationFormData) => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setIsSaving(false)
  }

  const handleAppearanceSave = async (data: AppearanceFormData) => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setIsSaving(false)
  }

  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsSaving(false)
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'account', label: 'Account', icon: Trash2 },
  ]

  return (
    <div className="space-y-6 animate-in max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-foreground-muted">Customize your experience</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-1 bg-muted p-1 rounded-xl"
        role="tablist"
        aria-label="Settings categories"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'notifications' && (
            <NotificationSettings form={notificationForm} onSave={handleNotificationSave} isSaving={isSaving} />
          )}
          {activeTab === 'appearance' && (
            <AppearanceSettings form={appearanceForm} onSave={handleAppearanceSave} isSaving={isSaving} />
          )}
          {activeTab === 'privacy' && <PrivacySettings />}
          {activeTab === 'security' && <SecuritySettings form={passwordForm} onSave={handlePasswordChange} isSaving={isSaving} />}
          {activeTab === 'account' && <AccountSettings />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function NotificationSettings({ form, onSave, isSaving }: { form: any; onSave: (data: any) => void; isSaving: boolean }) {
  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Email Notifications</h3>
        <div className="space-y-4">
          <NotificationItem
            label="Email notifications"
            description="Receive important updates via email"
            checked={form.watch('email')}
            onChange={(checked) => form.setValue('email', checked)}
          />
          <NotificationItem
            label="Quiz reminders"
            description="Get notified before upcoming quizzes"
            checked={form.watch('quizReminders')}
            onChange={(checked) => form.setValue('quizReminders', checked)}
          />
          <NotificationItem
            label="Study reminders"
            description="Daily reminders to keep your streak alive"
            checked={form.watch('studyReminders')}
            onChange={(checked) => form.setValue('studyReminders', checked)}
          />
        </div>
      </Card>

      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Push Notifications</h3>
        <div className="space-y-4">
          <NotificationItem
            label="Push notifications"
            description="Receive push notifications on your device"
            checked={form.watch('push')}
            onChange={(checked) => form.setValue('push', checked)}
          />
          <NotificationItem
            label="AI updates"
            description="Get notified about new AI features and improvements"
            checked={form.watch('aiUpdates')}
            onChange={(checked) => form.setValue('aiUpdates', checked)}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}

function NotificationItem({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-foreground-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function AppearanceSettings({ form, onSave, isSaving }: { form: any; onSave: (data: any) => void; isSaving: boolean }) {
  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Theme</h3>
        <div className="space-y-3">
          {['light', 'dark', 'system'].map((theme) => (
            <label key={theme} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <input
                type="radio"
                value={theme}
                {...form.register('theme')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground capitalize">{theme}</p>
                <p className="text-sm text-foreground-muted">
                  {theme === 'light' && 'Always use light mode'}
                  {theme === 'dark' && 'Always use dark mode'}
                  {theme === 'system' && 'Match system preference'}
                </p>
              </div>
              {theme === 'light' && <Sun className="h-5 w-5 text-warning-500" />}
              {theme === 'dark' && <Moon className="h-5 w-5 text-indigo-500" />}
            </label>
          ))}
        </div>
      </Card>

      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Font Size</h3>
        <div className="space-y-3">
          {['small', 'medium', 'large'].map((size) => (
            <label key={size} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <input
                type="radio"
                value={size}
                {...form.register('fontSize')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground capitalize">{size}</p>
                <p className="text-sm text-foreground-muted">
                  {size === 'small' && 'Compact text for more content'}
                  {size === 'medium' && 'Default comfortable reading size'}
                  {size === 'large' && 'Larger text for easier reading'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Accessibility</h3>
        <div className="space-y-4">
          <NotificationItem
            label="Reduce motion"
            description="Minimize animations and transitions"
            checked={form.watch('reducedMotion')}
            onChange={(checked) => form.setValue('reducedMotion', checked)}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}

function PrivacySettings() {
  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Profile Visibility</h3>
        <div className="space-y-3">
          {['public', 'friends', 'private'].map((visibility) => (
            <label key={visibility} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <input type="radio" name="visibility" value={visibility} className="h-4 w-4 text-primary-600 focus:ring-primary-500" defaultChecked={visibility === 'private'} />
              <div>
                <p className="font-medium text-foreground capitalize">{visibility}</p>
                <p className="text-sm text-foreground-muted">
                  {visibility === 'public' && 'Visible to everyone on the platform'}
                  {visibility === 'friends' && 'Visible only to your classmates and teachers'}
                  {visibility === 'private' && 'Visible only to you'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Data Sharing</h3>
        <div className="space-y-4">
          <NotificationItem
            label="Show progress"
            description="Allow others to see your learning progress"
            checked={false}
            onChange={() => {}}
          />
          <NotificationItem
            label="Show activity"
            description="Allow others to see your recent activity"
            checked={false}
            onChange={() => {}}
          />
          <NotificationItem
            label="Analytics"
            description="Help improve the platform by sharing anonymous usage data"
            checked={true}
            onChange={() => {}}
          />
        </div>
      </Card>

      <Card variant="elevated" padding="lg" className="border-error-200">
        <h3 className="font-semibold text-foreground mb-6">Data Management</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Download my data
          </Button>
          <Button variant="outline" className="w-full justify-start text-error-600 hover:bg-error-50 border-error-200">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete account
          </Button>
        </div>
      </Card>
    </div>
  )
}

function SecuritySettings({ form, onSave, isSaving }: { form: any; onSave: (data: any) => void; isSaving: boolean }) {
  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Change Password</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...form.register('currentPassword')}
              error={form.formState.errors.currentPassword?.message}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...form.register('newPassword')}
              error={form.formState.errors.newPassword?.message}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register('confirmPassword')}
              error={form.formState.errors.confirmPassword?.message}
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </Card>

      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Two-Factor Authentication</h3>
        <p className="text-foreground-muted mb-4">Add an extra layer of security to your account</p>
        <Button variant="outline" className="w-full">
          Enable 2FA
        </Button>
      </Card>

      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Active Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                <span className="font-medium text-primary-600">Chrome</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Current session</p>
                <p className="text-sm text-foreground-muted">Chrome on macOS • Active now</p>
              </div>
            </div>
            <Badge variant="success">Current</Badge>
          </div>
          <Button variant="ghost" className="w-full justify-start text-error-600 hover:bg-error-50">
            Log out of all other sessions
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Update Password
        </Button>
      </div>
    </form>
  )
}

function AccountSettings() {
  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-foreground mb-6">Account Information</h3>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-foreground-muted">Email</span>
            <span className="font-medium text-foreground">student@school.edu</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-foreground-muted">Role</span>
            <span className="font-medium text-foreground">Student</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-foreground-muted">Class</span>
            <span className="font-medium text-foreground">Class 10</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-foreground-muted">Joined</span>
            <span className="font-medium text-foreground">January 2024</span>
          </div>
        </div>
      </Card>

      <Card variant="elevated" padding="lg" className="border-error-200">
        <h3 className="font-semibold text-foreground mb-6">Danger Zone</h3>
        <p className="text-foreground-muted mb-6">Once you delete your account, there is no going back. All your data, progress, and settings will be permanently removed.</p>
        <Button variant="destructive" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account Permanently
        </Button>
      </Card>
    </div>
  )
}