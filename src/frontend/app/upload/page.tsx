"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, ArrowLeft, Share2, X, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function UploadPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploaded, setIsUploaded] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setIsUploaded(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setIsUploaded(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/mypage">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              マイページに戻る
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">投票写真アップロード</h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                投票写真をアップロード
              </CardTitle>
              <CardDescription>投票の証拠となる写真をアップロードしてください（任意）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!uploadedImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="text-lg font-medium text-gray-900 mb-2">写真を選択してください</div>
                      <div className="text-sm text-gray-600 mb-4">JPG、PNG、GIF形式（最大5MB）</div>
                      <Button type="button">
                        <Upload className="w-4 h-4 mr-2" />
                        ファイルを選択
                      </Button>
                    </Label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="アップロードされた投票写真"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeImage}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {isUploaded && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      写真がアップロードされました
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Card */}
          {uploadedImage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  SNSでシェア
                </CardTitle>
                <CardDescription>投票参加をSNSでシェアして、政治参加を促進しましょう</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button className="w-full bg-transparent" variant="outline">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Xでシェア
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebookでシェア
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" disabled={!uploadedImage}>
              <CheckCircle className="w-4 h-4 mr-2" />
              完了
            </Button>
            <Link href="/mypage" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                キャンセル
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
