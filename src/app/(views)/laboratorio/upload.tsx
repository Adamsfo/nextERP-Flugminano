'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilAlignCenter, cilTrash, cilCloudDownload } from '@coreui/icons'
import {
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTooltip,
} from '@coreui/react-pro'
import { API_BASE_URL } from '@/lib/api'
import { apiGeral } from '@/lib/geral'
import { Laboratorio } from '@/types/geral'
import { AppToaster, useAppToast } from '@/components/tz/useAppToast'

type Props = {
  laboratorio: Laboratorio
  onTemplateChange?: (template: Pick<Laboratorio, 'nomeTemplateProposta' | 'fileTemplateProposta'>) => void
}

const hasTemplate = (lab: Laboratorio): boolean =>
  Boolean(lab.nomeTemplateProposta?.trim())

const FileUpload: React.FC<Props> = ({ laboratorio, onTemplateChange }) => {
  const [arquivo, setArquivo] = useState<Laboratorio | null>(null)
  const [loadingDownload, setLoadingDownload] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const { toasts, pushToast } = useAppToast()

  const syncTemplateState = useCallback(
    (next: Pick<Laboratorio, 'nomeTemplateProposta' | 'fileTemplateProposta'>) => {
      if (next.nomeTemplateProposta) {
        setArquivo({ ...laboratorio, ...next })
      } else {
        setArquivo(null)
      }
      onTemplateChange?.(next)
    },
    [laboratorio, onTemplateChange]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      if (!laboratorio.id) {
        pushToast('Salve o laboratório antes de enviar o template.', 'warning')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('laboratorioId', laboratorio.id.toString())

      axios
        .post(`${API_BASE_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        })
        .then((response) => {
          const fileName = response.data.file as string
          syncTemplateState({
            nomeTemplateProposta: fileName,
            fileTemplateProposta: laboratorio.fileTemplateProposta ?? null,
          })
          pushToast('Template enviado com sucesso.', 'success')
        })
        .catch((error: unknown) => {
          const message =
            axios.isAxiosError(error) && error.response?.data
              ? String(error.response.data)
              : 'Erro ao carregar arquivo.'
          pushToast(message, 'danger')
        })
    },
    [laboratorio.fileTemplateProposta, laboratorio.id, pushToast, syncTemplateState]
  )

  useEffect(() => {
    if (hasTemplate(laboratorio)) {
      setArquivo({ ...laboratorio })
    } else {
      setArquivo(null)
    }
  }, [laboratorio])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  })

  const baixarArquivo = async () => {
    if (!arquivo?.id) {
      pushToast('Laboratório inválido para download.', 'danger')
      return
    }

    setLoadingDownload(true)
    try {
      const ret = await apiGeral.downloadLaboratorioTemplate(arquivo.id)
      if (!ret.success || !ret.data) {
        pushToast(ret.message || 'Erro ao baixar arquivo.', 'danger')
        return
      }

      const url = URL.createObjectURL(ret.data)
      window.open(url, '_blank')
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      pushToast('Download iniciado.', 'success')
    } finally {
      setLoadingDownload(false)
    }
  }

  const excluirArquivo = async () => {
    if (!arquivo?.id) {
      pushToast('Laboratório inválido para exclusão.', 'danger')
      return
    }

    const confirmar = window.confirm(
      `Excluir o template "${arquivo.nomeTemplateProposta}"? Esta ação não pode ser desfeita.`
    )
    if (!confirmar) return

    setLoadingDelete(true)
    try {
      const ret = await apiGeral.deleteLaboratorioTemplate(arquivo.id)
      if (!ret.success) {
        pushToast(ret.message || 'Erro ao excluir arquivo.', 'danger')
        return
      }

      syncTemplateState({
        nomeTemplateProposta: null,
        fileTemplateProposta: null,
      })
      pushToast('Template excluído com sucesso.', 'success')
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <div>
      {!arquivo && (
        <div className="file-upload" {...getRootProps()}>
          <input {...getInputProps()} />
          <p>Arraste ou selecione o template da proposta (.docx)</p>
        </div>
      )}

      <CTable align="middle" responsive striped style={{ marginBottom: '130px' }}>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">Template Proposta</CTableHeaderCell>
            <CTableHeaderCell scope="col" style={{ width: '70px' }} />
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {arquivo && (
            <CTableRow>
              <CTableDataCell>{arquivo.nomeTemplateProposta}</CTableDataCell>

              <CTableDataCell style={{ cursor: 'pointer' }}>
                <CDropdown variant="btn-group">
                  <CDropdownToggle className="py-0">
                    <CIcon icon={cilAlignCenter} size="lg" />
                  </CDropdownToggle>

                  <CDropdownMenu>
                    <CDropdownHeader className="bg-light fw-semibold py-2">Menu</CDropdownHeader>

                    <CDropdownItem onClick={baixarArquivo} disabled={loadingDownload}>
                      <CTooltip content="Baixar Arquivo">
                        <CIcon icon={cilCloudDownload} size="xl" style={{ marginRight: '6px' }} />
                      </CTooltip>
                      {loadingDownload ? 'Baixando...' : 'Baixar Arquivo'}
                    </CDropdownItem>

                    <CDropdownItem onClick={excluirArquivo} disabled={loadingDelete}>
                      <CTooltip content="Excluir Arquivo">
                        <CIcon icon={cilTrash} size="xl" style={{ marginRight: '6px' }} />
                      </CTooltip>
                      {loadingDelete ? 'Excluindo...' : 'Excluir Arquivo'}
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      <AppToaster toasts={toasts} />
    </div>
  )
}

export default FileUpload
