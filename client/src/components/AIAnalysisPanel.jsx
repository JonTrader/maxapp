import { Clipboard, Check } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function AIAnalysisPanel({ analysis }) {
  const [copied, setCopied] = useState(false)

  const matchScore = analysis?.matchScore ?? 0
  const missingKeywords = analysis?.missingKeywords ?? []
  const resumeSuggestions = analysis?.resumeSuggestions ?? []
  const coverLetterDraft = analysis?.coverLetterDraft ?? ''
  const verdict = analysis?.verdict ?? ''

  const showEmpty = !analysis || Object.keys(analysis).length === 0

  const copyDraft = async () => {
    if (!coverLetterDraft) return
    await navigator.clipboard.writeText(coverLetterDraft)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const scorePercentage = useMemo(() => {
    const val = Number(matchScore)
    if (Number.isNaN(val)) return 0
    return Math.max(0, Math.min(100, val))
  }, [matchScore])

  if (showEmpty) {
    return (
      <div className="rounded-xl border border-base-200 bg-base-100 p-6 text-center">
        <p className="text-sm text-base-content/70">No AI analysis yet. Run analysis to get insights.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-xl border border-base-200 bg-base-100 p-6">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AI Analysis</h3>
          <span className="text-sm text-base-content/60">Match Score</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-base-200">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{scorePercentage}%</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold">Missing keywords</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {missingKeywords.length ? (
              missingKeywords.map((keyword) => (
                <span key={keyword} className="badge badge-outline badge-sm">
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-sm text-base-content/60">No missing keywords detected.</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Resume suggestions</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-base-content/80">
            {resumeSuggestions.length ? (
              resumeSuggestions.map((line, idx) => <li key={`${line}-${idx}`}>{line}</li>)
            ) : (
              <li>No suggestions yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold">Cover letter draft</h4>
          <button
            type="button"
            className="btn btn-ghost btn-sm gap-2"
            onClick={copyDraft}
            disabled={!coverLetterDraft}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copied
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4" /> Copy
              </>
            )}
          </button>
        </div>
        <textarea
          className="textarea textarea-bordered mt-2 h-40 w-full resize-none"
          value={coverLetterDraft}
          readOnly
        />
      </div>

      <div className='mt-10'>
        <h4 className="text-sm font-semibold">Verdict:</h4>
        <div className='mt-2 italic underline'>{verdict}</div>
      </div>
    </div>
  )
}
