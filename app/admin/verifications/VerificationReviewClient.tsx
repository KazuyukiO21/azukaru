'use client'

import { useState } from 'react'
import {
  ShieldCheck, ShieldAlert, Clock, CheckCircle2, XCircle,
  Loader2, FileText, Award, User, Calendar, Eye
} from 'lucide-react'

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  drivers_license: '運転免許証',
  passport: 'パスポート',
  my_number_card: 'マイナンバーカード',
  health_insurance: '健康保険証',
  residence_card: '在留カード',
}

type ReviewStatus = 'pending' | 'approved' | 'rejected'

interface VerificationRecord {
  id: string
  user_id: string
  id_document_type: string
  id_document_url: string
  status: ReviewStatus
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
  profile?: { display_name: string; avatar_url?: string }
}

interface CertRecord {
  id: string
  user_id: string
  name: string
  issuer?: string
  issued_date?: string
  document_url?: string
  status: ReviewStatus
  created_at: string
  rejection_reason?: string
  profile?: { display_name: string; avatar_url?: string }
}

interface Props {
  pendingVerifications: VerificationRecord[]
  pendingCerts: CertRecord[]
  processedVerifications: VerificationRecord[]
}

type Tab = 'verification' | 'certification' | 'history'

export default function VerificationReviewClient({
  pendingVerifications: initPendingV,
  pendingCerts: initPendingC,
  processedVerifications,
}: Props) {
  const [tab, setTab] = useState<Tab>('verification')
  const [pendingV, setPendingV] = useState(initPendingV)
  const [pendingC, setPendingC] = useState(initPendingC)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null)

  const handleAction = async (
    id: string,
    action: 'approve' | 'reject',
    type: 'verification' | 'certification'
  ) => {
    setProcessingId(id)
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          type,
          rejection_reason: action === 'reject' ? (rejectReason[id] || '書類の内容が確認できませんでした') : undefined,
        }),
      })
      if (!res.ok) throw new Error('処理に失敗しました')

      if (type === 'verification') {
        setPendingV((prev) => prev.filter((v) => v.id !== id))
      } else {
        setPendingC((prev) => prev.filter((c) => c.id !== id))
      }
      setShowRejectInput(null)
    } catch {
      alert('処理に失敗しました。再度お試しください。')
    } finally {
      setProcessingId(null)
    }
  }

  const tabs = [
    {
      id: 'verification' as Tab,
      label: '本人確認',
      count: pendingV.length,
      icon: ShieldCheck,
    },
    {
      id: 'certification' as Tab,
      label: '資格証明',
      count: pendingC.length,
      icon: Award,
    },
    {
      id: 'history' as Tab,
      label: '処理済み',
      count: processedVerifications.length,
      icon: Clock,
    },
  ]

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                t.id === 'history'
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-primary-100 text-primary-600'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 本人確認タブ */}
      {tab === 'verification' && (
        <div className="space-y-4">
          {pendingV.length === 0 ? (
            <EmptyState icon={ShieldCheck} message="審査待ちの本人確認申請はありません" />
          ) : pendingV.map((v) => (
            <ReviewCard
              key={v.id}
              id={v.id}
              title={DOCUMENT_TYPE_LABELS[v.id_document_type] || v.id_document_type}
              subtitle={`提出日時: ${formatDate(v.submitted_at)}`}
              userName={v.profile?.display_name || '不明'}
              documentUrl={v.id_document_url}
              processingId={processingId}
              showRejectInput={showRejectInput}
              rejectReason={rejectReason[v.id] || ''}
              onApprove={() => handleAction(v.id, 'approve', 'verification')}
              onRejectToggle={() => setShowRejectInput(showRejectInput === v.id ? null : v.id)}
              onRejectConfirm={() => handleAction(v.id, 'reject', 'verification')}
              onRejectReasonChange={(val) => setRejectReason((prev) => ({ ...prev, [v.id]: val }))}
              iconEl={<ShieldCheck className="w-5 h-5 text-blue-500" />}
              iconBg="bg-blue-50"
              bucketName="id-documents"
            />
          ))}
        </div>
      )}

      {/* 資格証明タブ */}
      {tab === 'certification' && (
        <div className="space-y-4">
          {pendingC.length === 0 ? (
            <EmptyState icon={Award} message="審査待ちの資格証明はありません" />
          ) : pendingC.map((c) => (
            <ReviewCard
              key={c.id}
              id={c.id}
              title={c.name}
              subtitle={[c.issuer, c.issued_date?.slice(0, 7)].filter(Boolean).join(' | ')}
              userName={c.profile?.display_name || '不明'}
              documentUrl={c.document_url || ''}
              processingId={processingId}
              showRejectInput={showRejectInput}
              rejectReason={rejectReason[c.id] || ''}
              onApprove={() => handleAction(c.id, 'approve', 'certification')}
              onRejectToggle={() => setShowRejectInput(showRejectInput === c.id ? null : c.id)}
              onRejectConfirm={() => handleAction(c.id, 'reject', 'certification')}
              onRejectReasonChange={(val) => setRejectReason((prev) => ({ ...prev, [c.id]: val }))}
              iconEl={<Award className="w-5 h-5 text-yellow-500" />}
              iconBg="bg-yellow-50"
              bucketName="certifications"
            />
          ))}
        </div>
      )}

      {/* 処理済みタブ */}
      {tab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {processedVerifications.length === 0 ? (
            <EmptyState icon={Clock} message="処理済みの申請はありません" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">ユーザー</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">書類種別</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">提出日時</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">結果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {processedVerifications.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                          {v.profile?.display_name?.[0] || '?'}
                        </div>
                        <span className="text-gray-800 font-medium">{v.profile?.display_name || '不明'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {DOCUMENT_TYPE_LABELS[v.id_document_type] || v.id_document_type}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(v.submitted_at)}</td>
                    <td className="px-5 py-3.5">
                      {v.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />承認
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">
                          <XCircle className="w-3.5 h-3.5" />却下
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <Icon className="w-10 h-10 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

function ReviewCard({
  id, title, subtitle, userName, documentUrl, bucketName,
  processingId, showRejectInput, rejectReason,
  onApprove, onRejectToggle, onRejectConfirm, onRejectReasonChange,
  iconEl, iconBg,
}: {
  id: string
  title: string
  subtitle: string
  userName: string
  documentUrl: string
  bucketName: string
  processingId: string | null
  showRejectInput: string | null
  rejectReason: string
  onApprove: () => void
  onRejectToggle: () => void
  onRejectConfirm: () => void
  onRejectReasonChange: (val: string) => void
  iconEl: React.ReactNode
  iconBg: string
}) {
  const isProcessing = processingId === id
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Supabase Storage の署名なし URL（管理者向けは実際には署名付きURLが必要だが簡易実装）
  const viewUrl = documentUrl
    ? `${supabaseUrl}/storage/v1/object/authenticated/${bucketName}/${documentUrl}`
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
            {iconEl}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">{userName}</span>
            </div>
          </div>
        </div>

        {documentUrl && (
          <a
            href={`/api/admin/document-view?bucket=${bucketName}&path=${encodeURIComponent(documentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            書類を見る
          </a>
        )}
      </div>

      {/* 却下理由入力 */}
      {showRejectInput === id && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">却下理由（ユーザーに表示されます）</label>
          <textarea
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none min-h-[80px]"
            placeholder="例：書類が鮮明に読み取れませんでした。再度、明るい場所で撮影した画像をご提出ください。"
          />
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onApprove}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
        >
          {isProcessing
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <CheckCircle2 className="w-4 h-4" />
          }
          承認する
        </button>

        {showRejectInput === id ? (
          <button
            type="button"
            onClick={onRejectConfirm}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
          >
            {isProcessing
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <XCircle className="w-4 h-4" />
            }
            却下を確定
          </button>
        ) : (
          <button
            type="button"
            onClick={onRejectToggle}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 font-medium rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            却下する
          </button>
        )}
      </div>
    </div>
  )
}
