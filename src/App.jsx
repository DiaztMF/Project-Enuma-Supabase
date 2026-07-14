import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { UploadCloud, File, FileText, Loader2, Image as ImageIcon } from 'lucide-react'

function App() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [])

  async function fetchFiles() {
    try {
      setLoading(true)
      const { data, error } = await supabase.storage.from('uploads').list()
      
      if (error) {
        throw error
      }
      
      // Filter out empty folder placeholder if any
      const validFiles = data.filter(file => file.name !== '.emptyFolderPlaceholder')
      setFiles(validFiles)
    } catch (error) {
      console.error('Error fetching files:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile(event) {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      
      // Allowed types checking
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Hanya file JPG, PNG, dan PDF yang diperbolehkan.')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Reset file input
      event.target.value = null
      
      // Refresh list
      fetchFiles()
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  function getFileUrl(fileName) {
    const { data } = supabase.storage.from('uploads').getPublicUrl(fileName)
    return data.publicUrl
  }

  function getFileIcon(mimeType) {
    if (mimeType?.includes('image')) return <ImageIcon className="w-8 h-8 text-blue-500" />
    if (mimeType?.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
    return <File className="w-8 h-8 text-gray-500" />
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Supabase Storage</h1>
          <p className="mt-2 text-lg text-slate-600">Unggah dan kelola file dokumen & gambar Anda.</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors">
              <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-sm text-slate-600 font-medium mb-1">
                Pilih file untuk diunggah
              </p>
              <p className="text-xs text-slate-500 mb-6">PNG, JPG, PDF (Maks. 5MB)</p>
              
              <label className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                <span>{uploading ? 'Mengunggah...' : 'Pilih File'}</span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={uploadFile}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Daftar File</h3>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Belum ada file yang diunggah.</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map((file) => (
                  <li key={file.id} className="group relative rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow bg-white flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-slate-50 p-3 rounded-lg">
                      {getFileIcon(file.metadata?.mimetype)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {(file.metadata?.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div>
                      <a
                        href={getFileUrl(file.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Lihat
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
