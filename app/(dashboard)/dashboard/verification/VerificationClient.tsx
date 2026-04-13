'use client'

import { useState, useRef } from 'react'
import {
  ShieldCheck, ShieldAlert, Clock, Upload, Trash2,
  Loader2, CheckCircle2, PlusCircle, FileText, Award, X
} from 'lucide-react'

type VerificationStatus = 'pending' | 'approved' | 'rejected'

interface Verification {
  id: string
  user_id: string
  id_document_type: string
  id_document_url: string
  status: VerificationStatus
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
}

interface Certification {
  id: string
  user_id: string
  name: string
  issuer?: string
  issued_date?: string
  document_url?: string
  status: VerificationStatus
  created_at: string
}

interface Props {
  verification: Verification | null
  certifications: Certification[]
  userId: string
}

const DOCUMENT_TYPES = [
  { value: 'drivers_license', label: '運転免許証' },
  { value: 'passport', label: 'パスポート' },
  { value: 'my_number_card', label: 'マイナンバーカード' },
  { value: 'health_insurance', label: '健康保険証' },
  { value: 'residence_card', label: '在留カード' },
]

const STATUS_CONFIG: Record<VerificationStatus, { label: string; icon: React.ReactNode; class: string }> = {
  pending: {
    label: '審査中',
    icon: <Clock className="w-4 h-4" />,
    class: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
  approved: {
    label: '承認済み',
    icon: <ShieldCheck className="w-4 h-4" />,
    class: 'bg-green-50 border-green-200 text-green-700',
  },
  rejected: {
    label: '再提出が必要',
    icon: <ShieldAlert className="w-4 h-4" />,
    class: 'bg-red-50 border-red-200 text-red-700',
  },
}

export default function VerificationClient({ verification, certifications: initialCerts, userId }: Props) {
  // --- 本人確認 ---
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0].value)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idUploading, setIdUploading] = useState(false)
  const [idError, setIdError] = useState<string | null>(null)
  const [idSuccess, setIdSuccess] = useState(false)
  const [currentVerification, setCurrentVerification] = useState(verification)
  const idInputRef = useRef<HTMLInputElement>(null)

  // --- 資格証明 ---
  const [certs, setCerts] = useState<Certification[]>(initialCerts)
  const [showCertForm, setShowCertForm] = useState(false)
  const [certName, setCertName] = useState('')
  const [certIssuer, setCertIssuer] = useState('')
  const [certDate, setCertDate] = useState('')
  const [certFile, setCertFile] = useState<File | null>(null)
  const [certUploading, setCertUploading] = useState(false)
  const [certError, setCertError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const certInputRef = useRef<HTMLInputElement>(null)

  const handleIdUpload = async () => {
    if (!idFile) { setIdError('ファイルを選択してください'); return }
    setIdUploading(true)
    setIdError(null)

    const form = new FormData()
    form.append('file', idFile)
    form.append('documentType', docType)

    try {
      const res = await fetch('/api/upload/id-document', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'アップロードに失敗しました')
      setIdSuccess(true)
      setIdFile(null)
      setCurrentVerification({
        id: data.id || '',
        user_id: userId,
        id_document_type: docType,
        id_document_url: '',
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
    } catch (e: unknown) {
      setIdError(e instanceof Error ? e.message : 'アップロードに失敗しました')
    } finally {
      setIdUploading(false)
    }
  }

  const handleCertUpload = async () => {
    if (!certName.trim()) { setCertError('資格名を入力してください'); return }
    if (!certFile) { setCertError('証明書ファイルを選択してください'); return }
    setCertUploading(true)
    setCertError(null)

    const form = new FormData()
    form.append('file', certFile)
    form.append('name', certName)
    form.append('issuer', certIssuer)
    form.append('issuedDate', certDate)

    try {
      const res = await fetch('/api/upload/certification', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'アップロードに失敗しました')

      // 新しい資格をリストに追加
      const newCert: Certification = {
        id: data.id || String(Date.now()),
        user_id: userId,
        name: certName,
        issuer: certIssuer || undefined,
        issued_date: certDate || undefined,
        document_url: '',
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      setCerts((prev) => [newCert, ...prev])
      setCertName('')
      setCertIssuer('')
      setCertDate('')
      setCertFile(null)
      setShowCertForm(false)
    } catch (e: unknown) {
      setCertError(e instanceof Error ? e.message : 'アップロードに失敗しました')
    } finally {
      setCertUploading(false)
    }
  }

  const handleCertDelete = async (id: string) => {
    if (!confirm('この資格情報を削除しますか？')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/upload/certification?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('削除に失敗しました')
      setCerts((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert('削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  const verificationStatus = currentVerification?.status
  const docTypeLabel = DOCUMENT_TYPES.find(d => d.value === currentVerification?.id_document_type)?.label

  return (
    <div className="space-y-6">

      {/* ─── 本人確認セクション ─── */}
      <section className="card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">本人確認書類</h2>
            <p className="text-xs text-gray-500 mt-0.5">身分証明書を提出してアカウントを認証しましょう</p>
          </div>
        </div>

        {/* 承認済みの場合 */}
        {verificationStatus === 'approved' && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 border text-sm ${STATUS_CONFIG.approved.class}`}>
            {STATUS_CONFIG.approved.icon}
            <span className="font-semibold">本人確認済み</span>
            {docTypeLabel && <span className="text-green-600 text-xs">（{docTypeLabel}）</span>}
          </div>
        )}

        {/* 審査中の場合 */}
        {verificationStatus === 'pending' && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 border text-sm ${STATUS_CONFIG.pending.class}`}>
            {STATUS_CONFIG.pending.icon}
            <div>
              <span className="font-semibold">書類を審査中です</span>
              <p className="text-xs text-yellow-600 mt-0.5">通常1〜2営業日でご連絡します</p>
            </div>
          </div>
        )}

        {/* 却下された場合 */}
        {verificationStatus === 'rejected' && (
          <div className={`rounded-xl px-4 py-3 border text-sm mb-4 ${STATUS_CONFIG.rejected.class}`}>
            <div className="flex items-center gap-2 font-semibold mb-1">
              {STATUS_CONFIG.rejected.icon}
              <span>書類が承認されませんでした</span>
            </div>
            {currentVerification?.rejection_reason && (
              <p className="text-xs text-red-600">{currentVerification.rejection_reason}</p>
            )}
          </div>
        )}

        {/* アップロードフォーム（未提出 or 却下の場合） */}
        {(!verificationStatus || verificationStatus === 'rejected') && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="label">書類の種類 <span className="text-red-500">*</span></label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="input"
              >
                {DOCUMENT_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">書類の画像・PDF <span className="text-red-500">*</span></label>
              <div
                onClick={() => idInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
              >
                {idFile ? (
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <FileText className="w-5 h-5 text-primary-500 shrink-0" />
                    <span className="text-sm font-medium truncate max-w-xs">{idFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">クリックしてファイルを選択</p>
                    <p className="text-xs text-gray-400 mt-1">JPEG・PNG・PDF（10MB以下）</p>
                  </>
                )}
              </div>
              <input
                ref={idInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setIdFile(f); setIdError(null) }
                }}
              />
            </div>

            {idError && (
              <p className="text-sm text-red-500">{idError}</p>
            )}

            {idSuccess && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                提出が完了しました。審査をお待ちください。
              </div>
            )}

            <button
              type="button"
              onClick={handleIdUpload}
              disabled={idUploading || !idFile}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {idUploading
                ? <><Loader2 className="w-4 h-4 animate-spin" />提出中...</>
                : <><Upload className="w-4 h-4" />書類を提出する</>
              }
            </button>

            <p className="text-xs text-gray-400 text-center">
              ※ 提出書類は本人確認の目的のみに使用され、安全に管理されます
            </p>
          </div>
        )}
      </section>

      {/* ─── 資格証明セクション ─── */}
      <section className="card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">資格・認定証明書</h2>
              <p className="text-xs text-gray-500 mt-0.5">ペット関連の資格があると信頼度がアップします</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCertForm(true)}
            className="btn-outline flex items-center gap-1.5 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            追加
          </button>
        </div>

        {/* 追加フォーム */}
        {showCertForm && (
          <div className="border border-gray-200 rounded-2xl p-5 mb-5 bg-warm-50 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900 text-sm">資格を追加</p>
              <button
                type="button"
                onClick={() => { setShowCertForm(false); setCertError(null) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="label">資格・認定名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                className="input"
                placeholder="例：ペットシッター士、愛玩動物飼養管理士"
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">発行機関</label>
                <input
                  type="text"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  className="input"
                  placeholder="例：日本ペットシッター協会"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="label">取得年月</label>
                <input
                  type="month"
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">証明書ファイル <span className="text-red-500">*</span></label>
              <div
                onClick={() => certInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
              >
                {certFile ? (
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <FileText className="w-5 h-5 text-primary-500 shrink-0" />
                    <span className="text-sm font-medium truncate max-w-xs">{certFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                    <p className="text-sm text-gray-500">クリックして証明書を選択</p>
                    <p className="text-xs text-gray-400 mt-0.5">JPEG・PNG・PDF（10MB以下）</p>
                  </>
                )}
              </div>
              <input
                ref={certInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setCertFile(f); setCertError(null) }
                }}
              />
            </div>

            {certError && <p className="text-sm text-red-500">{certError}</p>}

            <button
              type="button"
              onClick={handleCertUpload}
              disabled={certUploading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {certUploading
                ? <><Loader2 className="w-4 h-4 animate-spin" />提出中...</>
                : <><Upload className="w-4 h-4" />資格を登録する</>
              }
            </button>
          </div>
        )}

        {/* 資格リスト */}
        {certs.length === 0 && !showCertForm ? (
          <div className="text-center py-8 text-gray-400">
            <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">まだ資格が登録されていません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certs.map((cert) => {
              const status = STATUS_CONFIG[cert.status] ?? STATUS_CONFIG.pending
              return (
                <div key={cert.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{cert.name}</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${status.class}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    {cert.issuer && (
                      <p className="text-xs text-gray-500 mt-0.5">{cert.issuer}</p>
                    )}
                    {cert.issued_date && (
                      <p className="text-xs text-gray-400">{cert.issued_date.slice(0, 7)} 取得</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCertDelete(cert.id)}
                    disabled={deletingId === cert.id}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                    aria-label="削除"
                  >
                    {deletingId === cert.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
