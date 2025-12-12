"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Upload, 
  Filter, 
  File, 
  Download, 
  Eye, 
  Trash2,
  Calendar,
  User,
  MoreHorizontal,
  FileText,
  ImageIcon,
  Video,
  Archive
} from "lucide-react"
import UploadAttachmentForm from './UploadAttachmentForm'

interface ProjectAttachmentsProps {
  projectId: string
  organisationId: string
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  uploadedBy: {
    id: string
    name: string
    avatar?: string
  }
  uploadedAt: string
  url: string
  description?: string
  tags: string[]
}

export default function ProjectAttachments({ projectId, organisationId }: ProjectAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const response = await fetch(`/api/${organisationId}/projects/${projectId}/attachments`)
        if (!response.ok) {
          throw new Error('Failed to fetch attachments')
        }
        const data = await response.json()
        
        // Transform data to match our interface
        const transformedAttachments: Attachment[] = data.map((attachment: any) => ({
          id: attachment._id,
          name: attachment.originalName,
          type: attachment.type,
          size: attachment.size,
          uploadedBy: {
            id: attachment.uploadedBy._id,
            name: attachment.uploadedBy.name,
            avatar: attachment.uploadedBy.avatar
          },
          uploadedAt: attachment.createdAt,
          url: attachment.url,
          description: attachment.description,
          tags: attachment.tags || []
        }))
        
        setAttachments(transformedAttachments)
      } catch (error) {
        console.error('Failed to fetch attachments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttachments()
  }, [projectId, organisationId])

  const refreshAttachments = () => {
    const fetchAttachments = async () => {
      try {
        const response = await fetch(`/api/${organisationId}/projects/${projectId}/attachments`)
        if (!response.ok) {
          throw new Error('Failed to fetch attachments')
        }
        const data = await response.json()
        
        // Transform data to match our interface
        const transformedAttachments: Attachment[] = data.map((attachment: any) => ({
          id: attachment._id,
          name: attachment.originalName,
          type: attachment.type,
          size: attachment.size,
          uploadedBy: {
            id: attachment.uploadedBy._id,
            name: attachment.uploadedBy.name,
            avatar: attachment.uploadedBy.avatar
          },
          uploadedAt: attachment.createdAt,
          url: attachment.url,
          description: attachment.description,
          tags: attachment.tags || []
        }))
        
        setAttachments(transformedAttachments)
      } catch (error) {
        console.error('Failed to fetch attachments:', error)
      }
    }

    fetchAttachments()
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return

    try {
      const response = await fetch(`/api/${organisationId}/projects/${projectId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete attachment')
      }

      // Refresh attachments list
      refreshAttachments()
    } catch (error) {
      console.error('Error deleting attachment:', error)
      // TODO: Show error toast
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'image':
      case 'figma':
      case 'design':
        return <ImageIcon className="h-8 w-8 text-blue-500" />
      case 'video':
        return <Video className="h-8 w-8 text-purple-500" />
      default:
        return <Archive className="h-8 w-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredAttachments = attachments.filter(attachment => {
    const matchesSearch = attachment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attachment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attachment.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = selectedType === 'all' || attachment.type === selectedType
    
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Attachments</h2>
          <p className="text-gray-600">Manage and organize project files</p>
        </div>
        <UploadAttachmentForm 
          projectId={projectId} 
          organisationId={organisationId}
          onAttachmentUploaded={refreshAttachments}
          trigger={
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          }
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Types</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="design">Design Files</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttachments.map((attachment) => (
          <Card key={attachment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(attachment.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{attachment.name}</h3>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {attachment.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {attachment.description}
                </p>
              )}
              
              {/* Tags */}
              {attachment.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {attachment.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    {attachment.uploadedBy.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{attachment.uploadedBy.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => handleDeleteAttachment(attachment.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAttachments.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try adjusting your search or filters' : 'Upload your first file to get started'}
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
