'use client'

import {
  CButton,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react-pro'
import { useState } from 'react'
import { apiGeral } from '@/lib/geral'
import { LaboratorioNomeToastFn } from './LaboratorioNomeInline'

type Props = {
  visible: boolean
  setVisible: (v: boolean) => void
  protocoloNumero: string
  onToast: LaboratorioNomeToastFn
  onSuccess: () => void
}

export default function ModalPreencherNomesSequencial({
  visible,
  setVisible,
  protocoloNumero,
  onToast,
  onSuccess,
}: Props) {
  const [prefix, setPrefix] = useState('Amostra ')
  const [saving, setSaving] = useState(false)

  const fechar = () => {
    if (!saving) setVisible(false)
  }

  const confirmar = async () => {
    const prefixTrim = prefix.trim()
    if (!prefixTrim) {
      onToast('Informe o prefixo para os nomes.', 'danger')
      return
    }

    setSaving(true)
    try {
      const ret = await apiGeral.preencherNomesLaboratoriosSequencial({
        protocolo_numero: protocoloNumero,
        prefix: prefixTrim,
      })
      if (!ret.success) {
        onToast(ret.message || 'Erro ao preencher nomes.', 'danger')
        return
      }
      const qtd = (ret.data as { updated?: number })?.updated ?? 0
      onToast(`${qtd} nome(s) preenchido(s) com sucesso.`, 'success')
      setVisible(false)
      onSuccess()
    } catch {
      onToast('Erro ao preencher nomes.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <CModal visible={visible} onClose={fechar} alignment="center">
      <CModalHeader>
        <CModalTitle>Preencher sequencialmente</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p className="text-body-secondary small mb-3">
          Protocolo <strong>{protocoloNumero}</strong>. Os nomes serão gerados como{' '}
          <em>prefixo + sequência da amostra</em> (ex.: &quot;Amostra 1&quot;, &quot;Amostra 2&quot;).
        </p>
        <CFormLabel htmlFor="lab-nome-prefix">Prefixo</CFormLabel>
        <CFormInput
          id="lab-nome-prefix"
          value={prefix}
          maxLength={200}
          disabled={saving}
          onChange={(e) => setPrefix(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void confirmar()
            }
          }}
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" disabled={saving} onClick={fechar}>
          Cancelar
        </CButton>
        <CButton color="primary" disabled={saving} onClick={() => void confirmar()}>
          {saving ? <CSpinner size="sm" className="me-2" /> : null}
          Aplicar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
