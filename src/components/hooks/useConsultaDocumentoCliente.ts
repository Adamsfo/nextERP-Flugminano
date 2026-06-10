'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { apiGeral } from '@/lib/geral'
import {
  consultarEPreencherDocumento,
  documentoCompletoParaProcessamento,
  mesclarEnderecoCliente,
  processarDocumentoCadastroRapido,
} from '@/lib/clienteFornecedorForm'
import { documentoValido } from '@/lib/documento'
import {
  ClienteFornecedor,
  EnderecoClienteFornecedor,
} from '@/types/geral'
import { AppToastColor } from '@/components/tz/useAppToast'

type Params = {
  formData: ClienteFornecedor
  formDataEndereco: EnderecoClienteFornecedor
  setFormData: React.Dispatch<React.SetStateAction<ClienteFornecedor>>
  setFormDataEndereco: React.Dispatch<React.SetStateAction<EnderecoClienteFornecedor>>
  onCepCompleto?: (cep: string) => void | Promise<EnderecoClienteFornecedor | null | void>
  onToast?: (message: string, color: AppToastColor) => void
  onMensagem?: (message: string) => void
  onClienteExistente?: (clienteId: number, endereco: EnderecoClienteFornecedor) => void | Promise<void>
  empresaId?: number
  enabled?: boolean
  resetKey?: string | number | boolean
}

export function useConsultaDocumentoCliente({
  formData,
  formDataEndereco,
  setFormData,
  setFormDataEndereco,
  onCepCompleto,
  onToast,
  onMensagem,
  onClienteExistente,
  empresaId,
  enabled = true,
  resetKey,
}: Params) {
  const [consultandoDocumento, setConsultandoDocumento] = useState(false)

  const consultandoRef = useRef(false)
  const ultimoDocumentoProcessadoRef = useRef('')
  const requestIdRef = useRef(0)

  const formDataRef = useRef(formData)
  const formDataEnderecoRef = useRef(formDataEndereco)
  const onCepCompletoRef = useRef(onCepCompleto)
  const onToastRef = useRef(onToast)
  const onMensagemRef = useRef(onMensagem)
  const onClienteExistenteRef = useRef(onClienteExistente)
  const empresaIdRef = useRef(empresaId)

  formDataRef.current = formData
  formDataEnderecoRef.current = formDataEndereco
  onCepCompletoRef.current = onCepCompleto
  onToastRef.current = onToast
  onMensagemRef.current = onMensagem
  onClienteExistenteRef.current = onClienteExistente
  empresaIdRef.current = empresaId

  useEffect(() => {
    ultimoDocumentoProcessadoRef.current = ''
  }, [resetKey])

  const aplicarDadosNoFormulario = (
    cliente: ClienteFornecedor,
    endereco: EnderecoClienteFornecedor
  ) => {
    flushSync(() => {
      setFormData((prev) => {
        const next = { ...prev }
        if (cliente.razaoSocialNome?.trim()) next.razaoSocialNome = cliente.razaoSocialNome.trim()
        if (cliente.nomeFantasia?.trim()) next.nomeFantasia = cliente.nomeFantasia.trim()
        if (cliente.email?.trim()) next.email = cliente.email.trim()
        if (cliente.telefoneFixo?.trim()) next.telefoneFixo = cliente.telefoneFixo.trim()
        if (cliente.telefoneCelular?.trim()) next.telefoneCelular = cliente.telefoneCelular.trim()
        if (cliente.observacao?.trim()) next.observacao = cliente.observacao.trim()
        return next
      })
      setFormDataEndereco((prev) => mesclarEnderecoCliente(prev, endereco))
    })
    formDataEnderecoRef.current = mesclarEnderecoCliente(formDataEnderecoRef.current, endereco)
  }

  const resolverEnderecoComCep = async (
    enderecoBase: EnderecoClienteFornecedor,
    cepParaBuscar?: string
  ): Promise<EnderecoClienteFornecedor> => {
    if (!cepParaBuscar || !onCepCompletoRef.current) {
      return enderecoBase
    }

    const atualizado = await onCepCompletoRef.current(cepParaBuscar)
    if (atualizado) {
      formDataEnderecoRef.current = atualizado
      return atualizado
    }

    return formDataEnderecoRef.current
  }

  useEffect(() => {
    if (!enabled) return

    const tipoDocumento = formData.tipoDocumento
    const documento = formData.cnpjCpf
    const digits = documento.replace(/\D/g, '')

    if (!documentoCompletoParaProcessamento(tipoDocumento, documento)) return
    if (!documentoValido(tipoDocumento, documento)) return
    if (ultimoDocumentoProcessadoRef.current === digits) return
    if (consultandoRef.current) return

    const requestId = ++requestIdRef.current

    const processar = async () => {
      consultandoRef.current = true
      setConsultandoDocumento(true)

      try {
        const empresa = empresaIdRef.current

        if (empresa) {
          const resultado = await processarDocumentoCadastroRapido(
            tipoDocumento,
            documento,
            formDataRef.current,
            formDataEnderecoRef.current,
            {
              empresaId: empresa,
              verificarDuplicidade: (docDigits) =>
                apiGeral.verificarClienteDuplicidade({
                  cnpjCpf: docDigits,
                  empresaId: empresa,
                  email: formDataRef.current.email?.trim() || undefined,
                }),
              consultarApi: (docDigits) => apiGeral.consultarDocumentoCliente(docDigits),
            }
          )

          if (requestId !== requestIdRef.current) return

          ultimoDocumentoProcessadoRef.current = digits

          if (resultado.acao === 'cliente_existente') {
            let enderecoFinal = formDataEnderecoRef.current

            if (resultado.dadosMapeados) {
              aplicarDadosNoFormulario(
                resultado.dadosMapeados.cliente,
                resultado.dadosMapeados.endereco
              )
              enderecoFinal = mesclarEnderecoCliente(
                formDataEnderecoRef.current,
                resultado.dadosMapeados.endereco
              )
              enderecoFinal = await resolverEnderecoComCep(
                enderecoFinal,
                resultado.dadosMapeados.cepParaBuscar
              )
            }

            console.log('Endereco Form', enderecoFinal)
            await onClienteExistenteRef.current?.(resultado.cliente.id, enderecoFinal)
            return
          }

          if (resultado.acao === 'erro') {
            const msg = resultado.mensagem
            onToastRef.current?.(msg, 'warning')
            onMensagemRef.current?.(msg)
            return
          }

          if (resultado.acao === 'preencher') {
            console.log('Dados enviados ao formulário', resultado.dadosMapeados)
            aplicarDadosNoFormulario(
              resultado.dadosMapeados.cliente,
              resultado.dadosMapeados.endereco
            )
            await resolverEnderecoComCep(
              formDataEnderecoRef.current,
              resultado.dadosMapeados.cepParaBuscar
            )
          }

          return
        }

        const resultado = await consultarEPreencherDocumento(
          tipoDocumento,
          documento,
          formDataRef.current,
          formDataEnderecoRef.current,
          (docDigits) => apiGeral.consultarDocumentoCliente(docDigits)
        )

        if (requestId !== requestIdRef.current) return

        ultimoDocumentoProcessadoRef.current = digits

        if (!resultado.consultouApi) return

        if (!resultado.encontrado) {
          const msg = resultado.mensagem || 'Documento não encontrado para preenchimento automático.'
          onToastRef.current?.(msg, 'warning')
          onMensagemRef.current?.(msg)
          return
        }

        if (resultado.dadosMapeados) {
          console.log('Dados enviados ao formulário', resultado.dadosMapeados)
          aplicarDadosNoFormulario(
            resultado.dadosMapeados.cliente,
            resultado.dadosMapeados.endereco
          )
          await resolverEnderecoComCep(
            formDataEnderecoRef.current,
            resultado.dadosMapeados.cepParaBuscar
          )
        }
      } catch {
        if (requestId === requestIdRef.current) {
          const msg = 'Erro ao processar documento.'
          onToastRef.current?.(msg, 'danger')
          onMensagemRef.current?.(msg)
        }
      } finally {
        consultandoRef.current = false
        if (requestId === requestIdRef.current) {
          setConsultandoDocumento(false)
        }
      }
    }

    void processar()
  }, [enabled, formData.cnpjCpf, formData.tipoDocumento, setFormData, setFormDataEndereco])

  return { consultandoDocumento }
}
