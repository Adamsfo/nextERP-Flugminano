'use client'

import { CFormInput, CSpinner } from '@coreui/react-pro'
import { Laboratorios } from '@/types/geral'
import { apiGeral } from '@/lib/geral'
import { KeyboardEvent, useEffect, useRef, useState } from 'react'

export type LaboratorioNomeToastFn = (message: string, color: 'success' | 'danger') => void

type Props = {
  item: Laboratorios
  onToast: LaboratorioNomeToastFn
  onSaved?: () => void
}

export default function LaboratorioNomeInline({ item, onToast, onSaved }: Props) {
  const [value, setValue] = useState(item.nome ?? '')
  const [saving, setSaving] = useState(false)
  const skipBlurSave = useRef(false)
  const lastSaved = useRef((item.nome ?? '').trim())

  useEffect(() => {
    const next = item.nome ?? ''
    setValue(next)
    lastSaved.current = next.trim()
  }, [item.id, item.nome])

  const save = async () => {
    if (saving) return

    const trimmed = value.trim()
    if (trimmed === lastSaved.current) return

    setSaving(true)
    try {
      const ret = await apiGeral.patchLaboratorioNome(item.id, trimmed || null)
      if (!ret.success) {
        setValue(item.nome ?? '')
        onToast(ret.message || 'Erro ao salvar o nome da amostra.', 'danger')
        return
      }
      lastSaved.current = trimmed
      onToast('Nome da amostra salvo.', 'success')
      onSaved?.()
    } catch {
      setValue(item.nome ?? '')
      onToast('Erro ao salvar o nome da amostra.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    }
    if (e.key === 'Escape') {
      skipBlurSave.current = true
      setValue(item.nome ?? '')
      e.currentTarget.blur()
    }
  }

  const handleBlur = () => {
    if (skipBlurSave.current) {
      skipBlurSave.current = false
      return
    }
    void save()
  }

  return (
    <td className="laboratorio-nome-cell py-2">
      <div className="laboratorio-nome-input-wrap">
        <CFormInput
          type="text"
          size="sm"
          value={value}
          disabled={saving}
          maxLength={255}
          placeholder="Nome da amostra"
          className="laboratorio-nome-input"
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
        {saving && (
          <span className="laboratorio-nome-spinner" aria-hidden>
            <CSpinner size="sm" />
          </span>
        )}
      </div>
    </td>
  )
}
