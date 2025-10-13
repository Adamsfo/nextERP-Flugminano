'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CDatePicker,
  CForm,
  CFormFeedback,
  CFormFloating,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CHeader,
  CRow,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { apiGeral } from '@/lib/geral'
import { ClienteFornecedor, EnderecoClienteFornecedor, FormPropsEdit } from '@/types/geral'
import PermissionGate from '@/components/auth/PermissionGate'
import TextInputField from '@/components/tz/TextInputField'
import { useTypedSelector } from '../../../store'
import CButtonSave from '@/components/tz/CButtonSave'
import CButtonBack from '@/components/tz/CButtonBack'
import SelectField from '@/components/tz/SelectField'
import SelectPais from '@/components/select/SelectPais'
import ModalMsg from '@/components/modal/ModalMsg'
import MaskedInputField from '@/components/tz/MaskedInputField'

const initialFormData: ClienteFornecedor = {
  id: 0,
  tipo: 'Cliente',
  cnpjCpf: '',
  razaoSocialNome: '',
  consumidorFinal: 'Sim',
  contribuinte: 'Sim',
  empresaId: 1,
  tipoDocumento: 'CPF',
  nacionalidade: 'Brazil',
}

const initialEndereco: EnderecoClienteFornecedor = {
  tipoEndereco: 'Residencial',
}

type Registro = ClienteFornecedor

export default function CidadeForm({ params }: { params: FormPropsEdit }) {
  const endpoint = '/cliente'
  const endpointApi = '/clienteFornecedor'
  const endpointApiEndereco = '/endereco'
  const router = useRouter()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<Registro>(initialFormData)
  const [formDataEndereco, setFormDataEndereco] =
    useState<EnderecoClienteFornecedor>(initialEndereco)
  const empresaIdSelecionada = useTypedSelector((state) => state.empresaId)
  const [modalMsg, setModalMsg] = useState(false)
  const [msg, setMsg] = useState('')

  const handleChange = (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: any
  ) => {
    if (e) {
      const { name, value, type } = e.target

      // Verifica o tipo do alvo para garantir que a lógica funcione para ambos os casos
      if (type === 'select-one') {
        // Lógica para o select
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }))
      } else if (type === 'checkbox') {
        // Lógica para o checkbox
        const checked = (e.target as HTMLInputElement).checked
        setFormData((prevData) => ({
          ...prevData,
          [name]: checked,
        }))
      } else {
        // Lógica para o input
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }))
      }
    } else if (customName && customValue !== undefined) {
      setFormData((prevData) => ({
        ...prevData,
        [customName]: customValue,
      }))
    }
  }

  const handleChangeEndereco = (
    e?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    customName?: string,
    customValue?: any
  ) => {
    if (e) {
      const { name, value, type } = e.target

      // Verifica o tipo do alvo para garantir que a lógica funcione para ambos os casos
      if (type === 'select-one') {
        // Lógica para o select
        setFormDataEndereco((prevData) => ({
          ...prevData,
          [name]: value,
        }))
      } else if (type === 'checkbox') {
        // Lógica para o checkbox
        const checked = (e.target as HTMLInputElement).checked
        setFormDataEndereco((prevData) => ({
          ...prevData,
          [name]: checked,
        }))
      } else {
        // Lógica para o input
        setFormDataEndereco((prevData) => ({
          ...prevData,
          [name]: value,
        }))
      }

      if (name === 'cep' && value.length === 9) {
        buscarCep(value)
      }
    } else if (customName && customValue !== undefined) {
      setFormDataEndereco((prevData) => ({
        ...prevData,
        [customName]: customValue,
      }))
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (params.id) {
        const registro = await apiGeral.getResourceById(endpointApi, parseInt(params.id))
        setFormData(registro as ClienteFornecedor)

        const registroEndereco = await apiGeral.getResource<EnderecoClienteFornecedor>(
          endpointApiEndereco,
          {
            filters: { clienteFornecedorId: params.id },
          }
        )
        if (registroEndereco.data && registroEndereco.data.length > 0) {
          setFormDataEndereco(registroEndereco.data[0] as EnderecoClienteFornecedor)
        }
      }
    }
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      let ret: { data?: { id: number }; success?: boolean; message?: string } = {}
      if (params.id) {
        ret = await apiGeral.updateResorce<ClienteFornecedor>(endpointApi, formData)
        await apiGeral.updateResorce<EnderecoClienteFornecedor>(
          endpointApiEndereco,
          formDataEndereco
        )
      } else {
        if (empresaIdSelecionada.length !== 1) {
          setErrors({ api: 'Selecione apenas uma empresa para criar o registro nesta empresa!' })
          return
        }
        formData.empresaId = empresaIdSelecionada[0]
        ret = await apiGeral.createResource<ClienteFornecedor>(endpointApi, formData)

        await apiGeral.createResource<EnderecoClienteFornecedor>(endpointApiEndereco, {
          ...formDataEndereco,
          clienteFornecedorId: ret.data?.id,
        })
      }
      console.log('ret', ret)
      if (!ret.success) {
        setErrors({ api: ret.message || 'Erro desconhecido' })
        return
      }
      router.push(`${endpoint}?filter=${ret.data?.id}`)
      if (params.onClose) {
        params.onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar registro:', error)
    }
  }

  const handleVoltar = async () => {
    router.push(endpoint)
    if (params.onClose) {
      params.onClose()
    }
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.nomeFantasia) newErrors.nomeFantasia = 'Nome fantasia é obrigatório.'
    // if (!formData.razaoSocialNome) newErrors.razaoSocialNome = 'Razão social é obrigatório.'
    if (!formData.cnpjCpf) newErrors.cnpjCpf = 'CPF / CNPJ é obrigatório.'

    return newErrors
  }

  // Função para retornar a máscara com base no tipo de documento selecionado
  const getMask = (tipo: string): string => {
    if (tipo === 'CPF') return '999.999.999-99'
    if (tipo === 'CNPJ') return '99.999.999/9999-99'
    if (tipo === 'RG') return '99.999.999-9'
    return '' // Outros tipos não têm máscara
  }

  const buscarCep = async (cep: string) => {
    const url = (cep: any) => `http://viacep.com.br/ws/${cep.replace('-', '')}/json/`

    // Verifica se o CEP é válido antes de fazer a requisição
    if (cep && cep.replace('-', '').length === 8) {
      try {
        const response = await fetch(url(cep), { mode: 'cors' })

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
          setMsg('Erro ao buscar o CEP')
          setModalMsg(true)
        }

        const data = await response.json()

        // Verifica se o CEP retornou um erro
        if (data.hasOwnProperty('erro')) {
          setMsg('CEP não encontrado')
          setModalMsg(true)
        } else {
          handleChangeEndereco(undefined, 'uf', data.uf)
          handleChangeEndereco(undefined, 'nomeCidade', data.localidade)
          handleChangeEndereco(undefined, 'cidadeId', data.ibge)
          handleChangeEndereco(undefined, 'bairro', data.bairro)
          handleChangeEndereco(undefined, 'rua', data.logradouro)
          handleChangeEndereco(undefined, 'complemento', data.complemento)
          handleChangeEndereco(undefined, 'observacao', data.unidade)
        }
      } catch (err) {
        // alert(err.message || 'Ocorreu um erro ao buscar o CEP.')
        // console.error(err) // Log do erro para depuração
      }
    } else {
      setMsg('CEP inválido. O CEP deve ter 8 dígitos.')
      setModalMsg(true)
    }
  }

  // useEffect(() => {
  //   // Chama buscarCep apenas se o CEP tiver 8 caracteres
  //   if (formDataEndereco.cep && formDataEndereco.cep.length === 9) {
  //     buscarCep()
  //   }
  // }, [formDataEndereco.cep])

  return (
    <PermissionGate permission={2}>
      <CForm onSubmit={handleSubmit}>
        <CCard>
          <CCardHeader>
            <strong>{params.id ? 'Alterando cliente' : 'Cadastrando cliente'}</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={1}>
                <TextInputField
                  name="id"
                  placeholder="Código"
                  value={formData.id !== 0 ? formData.id.toString() : ''}
                  onChange={handleChange}
                  invalid={!!errors.id}
                  feedbackMessage={errors.id}
                  disabled={true}
                />
              </CCol>

              {/* <CCol md={2}>
            <SelectField
              name="consumidorFinal"
              value={formData.consumidorFinal}
              onChange={handleChange}
              options={[
                { value: 'Sim', label: 'Sim' },
                { value: 'Não', label: 'Não' },
              ]}
              invalid={!!errors.consumidorFinal}
              feedbackMessage={errors.consumidorFinal}
              placeholder="Consumidor Final"
            />
          </CCol>

          <CCol md={2}>
            <SelectField
              name="contribuinte"
              value={formData.contribuinte}
              onChange={handleChange}
              options={[
                { value: 'Sim', label: 'Sim' },
                { value: 'Não', label: 'Não' },
              ]}
              invalid={!!errors.contribuinte}
              feedbackMessage={errors.contribuinte}
              placeholder="Contribuinte"
            />
          </CCol> */}

              <div className="w-100"></div>
              <CCol md={5}>
                <TextInputField
                  name="razaoSocialNome"
                  placeholder="Razão Social"
                  value={formData.razaoSocialNome ?? ''}
                  onChange={handleChange}
                  invalid={!!errors.razaoSocialNome}
                  feedbackMessage={errors.razaoSocialNome}
                />
              </CCol>

              <CCol md={5}>
                <TextInputField
                  name="nomeFantasia"
                  placeholder="Nome Fantasia"
                  value={formData.nomeFantasia ?? ''}
                  onChange={handleChange}
                  invalid={!!errors.nomeFantasia}
                  feedbackMessage={errors.nomeFantasia}
                />
              </CCol>

              <CCol md={2}>
                <div
                  className={`mydivborder ${errors.dataNascimento ? 'is-invalid' : ''}`}
                  style={{
                    flexDirection: 'column',
                    height: '60px',
                    borderRadius: '4px',
                    margin: '0px',
                    border: '1px solid',
                    borderColor: '',
                    marginBottom: '7px',
                  }}
                >
                  <div style={{ marginTop: '-2px', height: '17px', padding: '0px' }}>
                    <CFormLabel
                      style={{
                        margin: '0px',
                        fontSize: '13px',
                        marginRight: '10px',
                        marginLeft: '10px',
                        color: '#b1b7c1',
                      }}
                      htmlFor="validationText"
                    >
                      Data de Abertura
                    </CFormLabel>
                  </div>
                  <div
                    style={{
                      marginLeft: '10px',
                      display: 'flex',
                      height: '30px',
                      border: '0px',
                      marginRight: '10px',
                      marginTop: '5px',
                    }}
                  >
                    <CDatePicker
                      locale="pt-BR" // Define a localidade para português do Brasil
                      date={formData.dataNascimento} // Data selecionada
                      id="dataNascimento" // ID para conectar com o label
                      onDateChange={(date) => handleChange(undefined, 'dataNascimento', date)} // Atualiza o estado ao selecionar uma data
                      className={errors.dataNascimento ? 'is-invalid' : ''} // Classe de erro se houver
                    />
                    {errors.dataNascimento && (
                      <CFormFeedback invalid>{errors.dataNascimento}</CFormFeedback>
                    )}
                  </div>
                </div>
              </CCol>

              {/* <CCol md={2}>
            <div className="mb-3">
              <CFormLabel htmlFor="dataNascimento">Data de Nascimento</CFormLabel>
              <CDatePicker
                locale="pt-BR" // Define a localidade para português do Brasil
                date={formData.dataNascimento} // Data selecionada
                id="dataNascimento" // ID para conectar com o label
                onDateChange={(date) => handleChange(undefined, 'dataNascimento', date)} // Atualiza o estado ao selecionar uma data
                className={errors.dataNascimento ? 'is-invalid' : ''} // Classe de erro se houver
              />
              {errors.dataNascimento && (
                <CFormFeedback invalid>{errors.dataNascimento}</CFormFeedback>
              )}
            </div>
          </CCol> */}

              {/* <CCol md={2}>
                <SelectPais
                  id={formData.nacionalidade ?? ''}
                  setId={(value: string) => handleChange(undefined, 'nacionalidade', value)}
                  invalid={false}
                  feedbackMessage="Selecione um país válido."
                />
                {errors.nacionalidade && <div className="text-danger">{errors.nacionalidade}</div>}
              </CCol> */}

              <CCol md={2}>
                <SelectField
                  name="tipoDocumento"
                  value={formData.tipoDocumento ?? ''}
                  onChange={handleChange}
                  options={[
                    { value: 'RG', label: 'RG' },
                    { value: 'CPF', label: 'CPF' },
                    { value: 'CNPJ', label: 'CNPJ' },
                    { value: 'Passaporte', label: 'Passaporte' },
                    { value: 'Outro', label: 'Outro' },
                  ]}
                  invalid={!!errors.tipoDocumento}
                  feedbackMessage={errors.tipoDocumento}
                  placeholder="Tipo Documento"
                />
              </CCol>

              <CCol md={2}>
                <MaskedInputField
                  name="cnpjCpf"
                  placeholder={formData.tipoDocumento ?? ''}
                  value={formData.cnpjCpf}
                  onChange={handleChange}
                  invalid={!!errors.cnpjCpf}
                  feedbackMessage={errors.cnpjCpf}
                  mask={getMask(formData.tipoDocumento ?? '')}
                />
              </CCol>

              {/* <CCol md={2}>
                <SelectField
                  name="sexo"
                  value={formData.sexo ?? ''}
                  onChange={handleChange}
                  options={[
                    { value: 'Masculino', label: 'Masculino' },
                    { value: 'Feminino', label: 'Feminino' },
                  ]}
                  invalid={!!errors.sexo}
                  feedbackMessage={errors.sexo}
                  placeholder="Sexo"
                />
              </CCol> */}

              {/* <CCol md={6}>
            <MaskedInputField
              name="insEstadual"
              placeholder="Inscrição Estadual"
              value={formData.insEstadual || ''}
              onChange={handleChange}
              mask="9999999999-9" // Ajuste conforme necessário
              invalid={!!errors.insEstadual}
              feedbackMessage={errors.insEstadual}
            />
          </CCol>

          <CCol md={6}>
            <TextInputField
              name="insMunicipal"
              placeholder="Inscrição Municipal"
              value={formData.insMunicipal || ''}
              onChange={handleChange}
              invalid={!!errors.insMunicipal}
              feedbackMessage={errors.insEstadual}
            />
          </CCol> */}

              <CCol md={2}>
                <MaskedInputField
                  name="telefoneFixo"
                  placeholder="Telefone Fixo"
                  value={formData.telefoneFixo || ''}
                  onChange={handleChange}
                  mask="(99) 9.9999-9999" // Ajuste conforme necessário
                  invalid={!!errors.telefoneFixo}
                  feedbackMessage={errors.telefoneFixo}
                />
              </CCol>

              <CCol md={2}>
                <MaskedInputField
                  name="telefoneCelular"
                  placeholder="Telefone Celular"
                  value={formData.telefoneCelular || ''}
                  onChange={handleChange}
                  mask="(99) 9.9999-9999" // Ajuste conforme necessário
                  invalid={!!errors.telefoneCelular}
                  feedbackMessage={errors.telefoneCelular}
                />
              </CCol>

              <CCol md={4}>
                <CFormFloating className="mb-3">
                  <CFormInput
                    type="email"
                    id="email"
                    name="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={handleChange}
                    invalid={!!errors.email}
                  />
                  <CFormLabel>e-mail</CFormLabel>
                  {errors.email && <CFormFeedback invalid>{errors.email}</CFormFeedback>}
                </CFormFloating>
              </CCol>

              <CCol md={12}>
                <TextInputField
                  name="observacao"
                  placeholder="Observação"
                  value={formData.observacao ?? ''}
                  onChange={handleChange}
                  invalid={!!errors.observacao}
                  feedbackMessage={errors.observacao}
                />
              </CCol>

              {/* <CCol md={3}>
            <MaskedInputField
              name="telefoneAlternativo"
              placeholder="Telefone Alternativo"
              value={formData.telefoneAlternativo || ''}
              onChange={handleChange}
              mask="(99) 9.9999-9999" // Ajuste conforme necessário
              invalid={!!errors.telefoneAlternativo}
              feedbackMessage={errors.telefoneAlternativo}
            />
          </CCol>

          <CCol md={3}>
            <MaskedInputField
              name="telefoneWhatsApp"
              placeholder="Telefone WhatsApp"
              value={formData.telefoneWhatsApp || ''}
              onChange={handleChange}
              mask="(99) 9.9999-9999" // Ajuste conforme necessário
              invalid={!!errors.telefoneWhatsApp}
              feedbackMessage={errors.telefoneWhatsApp}
            />
          </CCol> */}

              <CCol xs={12}>
                <CCard>
                  <CCardHeader>
                    {/* Endereço */}
                    <strong>Endereço</strong>
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={2}>
                        <MaskedInputField
                          name="cep"
                          placeholder="CEP"
                          value={formDataEndereco.cep || ''}
                          onChange={handleChangeEndereco}
                          mask="99999-999" // Ajuste conforme necessário
                          invalid={!!errors.cep}
                          feedbackMessage={errors.cep}
                        />
                      </CCol>

                      <CCol md={1}>
                        <TextInputField
                          name="uf"
                          placeholder="UF"
                          value={formDataEndereco.uf ?? ''}
                          onChange={handleChangeEndereco}
                          invalid={!!errors.uf}
                          feedbackMessage={errors.uf}
                        />
                      </CCol>

                      <CCol md={2}>
                        <TextInputField
                          name="cidade"
                          placeholder="Cidade"
                          value={formDataEndereco.nomeCidade ?? ''}
                          onChange={handleChangeEndereco}
                          invalid={!!errors.cidade}
                          feedbackMessage={errors.cidade}
                        />
                      </CCol>

                      <CCol md={3}>
                        <TextInputField
                          name="bairro"
                          placeholder="Bairro"
                          value={formDataEndereco.bairro ?? ''}
                          onChange={handleChangeEndereco}
                          invalid={!!errors.bairro}
                          feedbackMessage={errors.bairro}
                        />
                      </CCol>

                      <CCol md={3}>
                        <TextInputField
                          name="rua"
                          placeholder="Logradouro"
                          value={formDataEndereco.rua ?? ''}
                          onChange={handleChangeEndereco}
                          invalid={!!errors.rua}
                          feedbackMessage={errors.rua}
                        />
                      </CCol>

                      <CCol md={1}>
                        <TextInputField
                          name="numero"
                          placeholder="Número"
                          value={formDataEndereco.numero ?? ''}
                          onChange={handleChangeEndereco}
                          invalid={!!errors.numero}
                          feedbackMessage={errors.numero}
                        />
                      </CCol>

                      <CCol md={5}>
                        <TextInputField
                          name="complemento"
                          placeholder="Complemento"
                          value={formDataEndereco.complemento ?? ''}
                          onChange={handleChangeEndereco}
                          invalid={!!errors.complemento}
                          feedbackMessage={errors.complemento}
                        />
                      </CCol>

                      <CCol md={7}>
                        <TextInputField
                          name="observacao"
                          placeholder="Observação"
                          value={formDataEndereco.observacao ?? ''}
                          onChange={handleChangeEndereco}
                          invalid={!!errors.observacao}
                          feedbackMessage={errors.observacao}
                        />
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            {errors.api && <div className="text-danger">{errors.api}</div>}
            <ModalMsg visible={modalMsg} setVisible={setModalMsg} msg={msg}></ModalMsg>
          </CCardBody>
          <CCardFooter>
            <CButtonBack onClick={handleVoltar} />
            <CButtonSave type="submit" label={params.id ? 'Atualizar' : 'Cadastrar'} />
          </CCardFooter>
        </CCard>
      </CForm>
    </PermissionGate>
  )
}
