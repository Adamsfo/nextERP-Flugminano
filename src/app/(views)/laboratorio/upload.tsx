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
import { Laboratorio } from '@/types/geral'

type Props = {
  laboratorio: Laboratorio
}

const FileUpload: React.FC<Props> = ({ laboratorio }) => {
  const [arquivo, setArquivo] = useState<Laboratorio | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)
      formData.append('laboratorioId', laboratorio.id.toString())

      axios
        .post(API_BASE_URL + '/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          const fileName = response.data.file

          setArquivo({ ...laboratorio, nomeTemplateProposta: fileName })
        })
        .catch((error) => {
          console.error('Erro ao carregar arquivo:', error)
        })
    },
    [laboratorio.id]
  )

  useEffect(() => {
    if (laboratorio?.nomeTemplateProposta) {
      setArquivo({ ...laboratorio, nomeTemplateProposta: laboratorio.nomeTemplateProposta })
    }
  }, [laboratorio])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
  })

  const baixarArquivo = () => {
    // if (!arquivo) return
    // const url = URL.createObjectURL(arquivo)
    // window.open(url, '_blank')
  }

  const excluirArquivo = () => {
    setArquivo(null)
  }

  return (
    <div>
      {!arquivo && (
        <div className="file-upload" {...getRootProps()}>
          <input {...getInputProps()} />
          <p>Arraste ou selecione o template da proposta</p>
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

                    <CDropdownItem onClick={baixarArquivo}>
                      <CTooltip content="Baixar Arquivo">
                        <CIcon icon={cilCloudDownload} size="xl" style={{ marginRight: '6px' }} />
                      </CTooltip>
                      Baixar Arquivo
                    </CDropdownItem>

                    <CDropdownItem onClick={excluirArquivo}>
                      <CTooltip content="Excluir Arquivo">
                        <CIcon icon={cilTrash} size="xl" style={{ marginRight: '6px' }} />
                      </CTooltip>
                      Excluir Arquivo
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default FileUpload
