'use client'

import { ChangeEvent } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormFeedback,
  CFormFloating,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react-pro'
import { ClienteFornecedor, EnderecoClienteFornecedor } from '@/types/geral'
import TextInputField from '@/components/tz/TextInputField'
import SelectField from '@/components/tz/SelectField'
import MaskedInputField from '@/components/tz/MaskedInputField'
import {
  getClienteDocumentoMask,
  TipoPessoa,
  tipoDocumentoFromPessoa,
} from '@/lib/clienteFornecedorForm'

type Props = {
  formData: ClienteFornecedor
  formDataEndereco: EnderecoClienteFornecedor
  errors: Record<string, string>
  tipoPessoa: TipoPessoa
  onTipoPessoaChange: (tipo: TipoPessoa) => void
  onChangeCliente: (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: unknown
  ) => void
  onChangeEndereco: (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: unknown
  ) => void
  showObservacao?: boolean
}

export default function ClienteFornecedorFormFields({
  formData,
  formDataEndereco,
  errors,
  tipoPessoa,
  onTipoPessoaChange,
  onChangeCliente,
  onChangeEndereco,
  showObservacao = true,
}: Props) {
  const handleTipoPessoa = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TipoPessoa
    onTipoPessoaChange(value)
    onChangeCliente(undefined, 'tipoDocumento', tipoDocumentoFromPessoa(value))
    onChangeCliente(undefined, 'cnpjCpf', '')
  }

  return (
    <CRow className="g-3">
      <CCol md={6}>
        <TextInputField
          name="razaoSocialNome"
          placeholder="Nome / Razão Social *"
          value={formData.razaoSocialNome ?? ''}
          onChange={onChangeCliente}
          invalid={!!errors.razaoSocialNome}
          feedbackMessage={errors.razaoSocialNome}
        />
      </CCol>

      <CCol md={6}>
        <TextInputField
          name="nomeFantasia"
          placeholder="Nome Fantasia"
          value={formData.nomeFantasia ?? ''}
          onChange={onChangeCliente}
          invalid={!!errors.nomeFantasia}
          feedbackMessage={errors.nomeFantasia}
        />
      </CCol>

      <CCol md={3}>
        <SelectField
          name="tipoPessoa"
          value={tipoPessoa}
          onChange={handleTipoPessoa}
          options={[
            { value: 'Fisica', label: 'Pessoa Física' },
            { value: 'Juridica', label: 'Pessoa Jurídica' },
          ]}
          invalid={!!errors.tipoPessoa}
          feedbackMessage={errors.tipoPessoa}
          placeholder="Tipo Pessoa *"
        />
      </CCol>

      <CCol md={3}>
        <MaskedInputField
          name="cnpjCpf"
          placeholder={formData.tipoDocumento === 'CNPJ' ? 'CNPJ *' : 'CPF *'}
          value={formData.cnpjCpf}
          onChange={onChangeCliente}
          invalid={!!errors.cnpjCpf}
          feedbackMessage={errors.cnpjCpf}
          mask={getClienteDocumentoMask(formData.tipoDocumento)}
        />
      </CCol>

      <CCol md={3}>
        <MaskedInputField
          name="insEstadual"
          placeholder="Inscrição Estadual"
          value={formData.insEstadual || ''}
          onChange={onChangeCliente}
          mask="9999999999-9"
          invalid={!!errors.insEstadual}
          feedbackMessage={errors.insEstadual}
        />
      </CCol>

      <CCol md={3}>
        <CFormFloating>
          <CFormInput
            type="email"
            id="clienteRapidoEmail"
            name="email"
            placeholder=" "
            value={formData.email ?? ''}
            onChange={onChangeCliente}
            invalid={!!errors.email}
          />
          <CFormLabel htmlFor="clienteRapidoEmail">E-mail</CFormLabel>
          {errors.email && <CFormFeedback invalid>{errors.email}</CFormFeedback>}
        </CFormFloating>
      </CCol>

      <CCol md={3}>
        <MaskedInputField
          name="telefoneFixo"
          placeholder="Telefone"
          value={formData.telefoneFixo || ''}
          onChange={onChangeCliente}
          mask="(99) 9.9999-9999"
          invalid={!!errors.telefoneFixo}
          feedbackMessage={errors.telefoneFixo}
        />
      </CCol>

      <CCol md={3}>
        <TextInputField
          name="contato"
          placeholder="Contato"
          value={formData.contato ?? ''}
          onChange={onChangeCliente}
          invalid={!!errors.contato}
          feedbackMessage={errors.contato}
        />
      </CCol>

      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Endereço</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="g-3">
              <CCol md={2}>
                <MaskedInputField
                  name="cep"
                  placeholder="CEP"
                  value={formDataEndereco.cep || ''}
                  onChange={onChangeEndereco}
                  mask="99999-999"
                  invalid={!!errors.cep}
                  feedbackMessage={errors.cep}
                />
              </CCol>

              <CCol md={1}>
                <TextInputField
                  name="uf"
                  placeholder="UF"
                  value={formDataEndereco.uf ?? ''}
                  onChange={onChangeEndereco}
                  invalid={!!errors.uf}
                  feedbackMessage={errors.uf}
                />
              </CCol>

              <CCol md={3}>
                <TextInputField
                  name="nomeCidade"
                  placeholder="Cidade"
                  value={formDataEndereco.nomeCidade ?? ''}
                  onChange={onChangeEndereco}
                  invalid={!!errors.cidade}
                  feedbackMessage={errors.cidade}
                />
              </CCol>

              <CCol md={3}>
                <TextInputField
                  name="bairro"
                  placeholder="Bairro"
                  value={formDataEndereco.bairro ?? ''}
                  onChange={onChangeEndereco}
                  invalid={!!errors.bairro}
                  feedbackMessage={errors.bairro}
                />
              </CCol>

              <CCol md={3}>
                <TextInputField
                  name="rua"
                  placeholder="Rua"
                  value={formDataEndereco.rua ?? ''}
                  onChange={onChangeEndereco}
                  invalid={!!errors.rua}
                  feedbackMessage={errors.rua}
                />
              </CCol>

              <CCol md={2}>
                <TextInputField
                  name="numero"
                  placeholder="Número"
                  value={formDataEndereco.numero ?? ''}
                  onChange={onChangeEndereco}
                  invalid={!!errors.numero}
                  feedbackMessage={errors.numero}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>

      {showObservacao && (
        <CCol md={12}>
          <TextInputField
            name="observacao"
            placeholder="Observação"
            value={formData.observacao ?? ''}
            onChange={onChangeCliente}
            invalid={!!errors.observacao}
            feedbackMessage={errors.observacao}
          />
        </CCol>
      )}
    </CRow>
  )
}
