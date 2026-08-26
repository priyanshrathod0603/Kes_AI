'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDate, formatTime, truncate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useStudyMaterials, useFavorites, useRecentMaterials, useToggleFavorite, useDownloadMaterial } from '@/hooks'
import { SUBJECTS } from '@/lib/constants'
import { Search, Filter, Download, Heart, HeartOff, Eye, FileText, ChevronDown, MoreHorizontal } from 'lucide-react'

export function StudyMaterialPage() {
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('uploadedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const { data: materials, isLoading, refetch } = useStudyMaterials({
    search,
    subjectId: subjectFilter,
    type: typeFilter,
    sortBy,
    sortOrder,
    favoritesOnly: showFavoritesOnly,
  })

  const { mutateAsync: toggleFavorite } = useToggleFavorite()
  const { mutateAsync: downloadMaterial } = useDownloadMaterial()

  const handleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      await toggleFavorite(id)
      refetch()
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const response = await downloadMaterial(id)
      if (response.data?.url) {
        window.open(response.data.url, '_blank')
      }
    } catch (error) {
      console.error('Failed to download:', error)
    }
  }

  const filteredMaterials = materials || []

  return (
    <div className="space-y-6 animate-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Material</h1>
          <p className="text-foreground-muted">Access your learning resources and documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <FileText className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
            <Heart className={cn('h-4 w-4', showFavoritesOnly ? 'fill-current text-red-500' : '')} />
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          <Input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="doc">Document</option>
            <option value="ppt">Presentation</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Sort
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setSortBy('uploadedAt'); setSortOrder('desc'); }}>Newest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('uploadedAt'); setSortOrder('asc'); }}>Oldest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('asc'); }}>Title A-Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('desc'); }}>Title Z-A</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSortBy('fileSize'); setSortOrder('desc'); }}>Largest first</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} variant="elevated" padding="lg">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" variant="circular" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded mt-2" />
                <Skeleton className="h-4 w-1/4 rounded mt-4" />
              </Card>
            ))}
          </div>
        ) : filteredMaterials.length === 0 ? (
          <Card variant="elevated" padding="xl" className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-foreground-muted mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No materials found</h3>
            <p className="text-foreground-muted mt-2">Try adjusting your filters or search terms</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setSubjectFilter(''); setTypeFilter(''); setShowFavoritesOnly(false); }}>
              Clear filters
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MaterialCard
                  material={material}
                  onFavorite={handleFavorite}
                  onDownload={handleDownload}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MaterialListItem
                  material={material}
                  onFavorite={handleFavorite}
                  onDownload={handleDownload}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function MaterialCard({ material, onFavorite, onDownload }: { material: any; onFavorite: (id: string, fav: boolean) => void; onDownload: (id: string) => void }) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText
      case 'doc': return FileText
      case 'ppt': return FileText
      case 'video': return FileText
      default: return FileText
    }
  }

  const FileIcon = getFileIcon(material.fileType)
  const subject = SUBJECTS.find(s => s.id === material.subjectId)

  return (
    <Card variant="elevated" padding="lg" className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <FileIcon className="h-6 w-6 text-foreground-muted" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDownload(material.id)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFavorite(material.id, !material.isFavorite)}>
              {material.isFavorite ? <Heart className="h-4 w-4 fill-current text-red-500 mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
              {material.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{material.title}</h3>
      <p className="text-sm text-foreground-muted line-clamp-2 mb-4 flex-1">{material.description || 'No description'}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {subject && <Badge variant="secondary" className="text-xs">{subject.name}</Badge>}
        <Badge variant="outline" className="text-xs capitalize">{material.fileType}</Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-foreground-muted border-t border-border pt-3">
        <span>{formatDate(material.uploadedAt)}</span>
        <span>{formatFileSize(material.fileSize)}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onDownload(material.id)}>
          <Download className="h-4 w-4 mr-1" />
          Open
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onFavorite(material.id, !material.isFavorite)}>
          {material.isFavorite ? <Heart className="h-4 w-4 fill-current text-red-500" /> : <Heart className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
  )
}

function MaterialListItem({ material, onFavorite, onDownload }: { material: any; onFavorite: (id: string, fav: boolean) => void; onDownload: (id: string) => void }) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText
      case 'doc': return FileText
      case 'ppt': return FileText
      case 'video': return FileText
      default: return FileText
    }
  }

  const FileIcon = getFileIcon(material.fileType)
  const subject = SUBJECTS.find(s => s.id === material.subjectId)

  return (
    <Card variant="elevated" padding="md" className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted flex-shrink-0">
        <FileIcon className="h-6 w-6 text-foreground-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{material.title}</h3>
        <p className="text-sm text-foreground-muted truncate">{material.description || 'No description'}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {subject && <Badge variant="secondary" className="text-xs">{subject.name}</Badge>}
          <Badge variant="outline" className="text-xs capitalize">{material.fileType}</Badge>
        </div>
      </div>
      <div className="text-right text-xs text-foreground-muted hidden sm:block w-32">
        <p>{formatDate(material.uploadedAt)}</p>
        <p>{formatFileSize(material.fileSize)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onDownload(material.id)}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onFavorite(material.id, !material.isFavorite)}>
          {material.isFavorite ? <Heart className="h-4 w-4 fill-current text-red-500" /> : <Heart className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDownload(material.id)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFavorite(material.id, !material.isFavorite)}>
              {material.isFavorite ? <Heart className="h-4 w-4 fill-current text-red-500 mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
              {material.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}