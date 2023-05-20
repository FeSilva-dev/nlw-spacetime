'use client'

import { ChangeEvent, useState } from 'react'

export default function MediaPicker() {
  const [preview, setPreview] = useState<string | null>(null)

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target

    if (!files) {
      return
    }

    const previewURL = URL.createObjectURL(files[0])

    setPreview(previewURL)
  }

  return (
    <>
      <input
        name="coverUrl"
        onChange={onFileSelected}
        type="file"
        id="file"
        className="invisible h-0 w-0"
        accept="image/*"
      />
      {preview && (
        // eslint-disable-next-line
        <img
          src={preview}
          alt="Memory image"
          className="aspect-video w-full rounded-lg object-cover"
        />
      )}
    </>
  )
}
