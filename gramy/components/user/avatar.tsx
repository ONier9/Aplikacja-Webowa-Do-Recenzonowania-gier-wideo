'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabaseClient'

type AvatarProps = {
  uid: string | null
  url: string | null
  size: number
  onUpload: (publicUrl: string) => void
}

export default function Avatar({ uid, url, size, onUpload }: AvatarProps) {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!url) {
      setAvatarUrl(null)
      return
    }

    if (url.startsWith('http')) {
      setAvatarUrl(url)
      return
    }

    async function loadStorageImage(path: string) {
      try {
        const { data, error } = await supabase.storage.from('avatars').download(path)
        if (error) return console.error('Error downloading avatar:', error)

        const blobUrl = URL.createObjectURL(data)
        setAvatarUrl(blobUrl)
      } catch (err) {
        console.error('Avatar download failed:', err)
      }
    }

    loadStorageImage(url)
  }, [url])

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    try {
      setUploading(true)

      const file = e.target.files?.[0]
      if (!file) throw new Error('Please select an image.')
      if (!user?.id) throw new Error('User not logged in.')

      if (file.size > 2 * 1024 * 1024) throw new Error('Max file size is 2MB.')
      if (!file.type.startsWith('image/')) throw new Error('Invalid file type.')

      const ext = file.name.split('.').pop()?.toLowerCase()
      const filePath = `${user.id}-${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: false })

      if (uploadErr) throw uploadErr

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      onUpload(publicUrlData.publicUrl)
      setAvatarUrl(publicUrlData.publicUrl)
    } catch (err: any) {
      alert(err.message)
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-3">

      <div
        className="rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={size}
            height={size}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-gray-400 text-sm">No Image</span>
        )}
      </div>

      <label
        htmlFor="avatarUpload"
        className={`px-4 py-2 rounded text-white text-sm cursor-pointer transition-colors 
          ${uploading ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-teal-600 hover:bg-teal-700'}
        `}
      >
        {uploading ? 'Uploading…' : 'Upload Avatar'}
      </label>

      <input
        id="avatarUpload"
        type="file"
        accept="image/*"
        disabled={uploading || !user}
        onChange={uploadAvatar}
        className="hidden"
      />

      <p className="text-xs text-gray-400">
        Max 2MB • PNG, JPG, GIF
      </p>
    </div>
  )
}
