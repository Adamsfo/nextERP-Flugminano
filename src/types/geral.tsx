// types/geral.ts

export interface QueryParams {
  [key: string]: any
}

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  meta?: T
  message?: string
  headers?: Headers
}

export interface Login {
  login: string
  senha: string
}

export interface Usuario {
  id?: number
  login: string
  email: string
  senha?: string
  nomeCompleto: string
  confirmaSenha?: string
  ativo?: boolean
  alterarSenha?: boolean
  idFuncaoUsuario?: number
}

export interface Cidade {
  id: number
  descricao: string
  uf: string
}

export interface FormPropsEdit {
  id?: string
  onClose?: () => void
}

export interface Empresa {
  id: number
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  dataInicioAtividades: Date
  cep: string
  endereco: string
  numero: string
  complemento?: string
  bairro?: string
  idCidade: number
  logradouro?: string
  telefone?: string
  ultimoNumeroNFe?: number
  ultimoNumeroNFCe?: number
  numeroSerieNFe?: number
  numeroSerieNFCe?: number
  ambienteNFe: 'Produção' | 'Homologação'
  regimeTributario: 'Simples Nacional' | 'Regime Normal'
  tipo: 'principal' | 'filial'
  CSCID?: string
  CSC?: string
}

export interface ClienteFornecedor {
  id: number
  tipo: 'Cliente' | 'Fornecedor'
  cnpjCpf: string
  insEstadual?: string
  insMunicipal?: string
  razaoSocialNome: string
  nomeFantasia?: string
  consumidorFinal: 'Sim' | 'Não'
  contribuinte: 'Sim' | 'Não'
  cnae?: string
  email?: string
  email2?: string
  telefoneFixo?: string
  telefoneCelular?: string
  telefoneAlternativo?: string
  telefoneWhatsApp?: string
  dataNascimento?: Date
  sexo?: 'Masculino' | 'Feminino'
  nacionalidade?: string
  tipoDocumento?: 'RG' | 'CPF' | 'CNPJ' | 'Passaporte' | 'Outro'
  limiteCredito?: number
  observacao?: string
  empresaId: number
  contato?: string
}

export interface FuncaoUsuario {
  id: number
  funcaoUsuario: string
}

export interface FuncaoUsuarioAcesso {
  id?: number
  idFuncaoSistema: number
  idFuncaoUsuario: number
  funcaoSistema_funcaoSistema?: string
  funcaoUsuario_funcaoUsuario?: string
}

export interface FuncaoSistema {
  id: number
  funcaoSistema: string
}

export interface UsuarioEmpresa {
  id?: number
  usuarioId: number
  empresaId: number
  empresa_nomeFantasia?: string
}

export interface Pais {
  name: string
  alpha2Code: string
}

export interface EnderecoClienteFornecedor {
  id?: number
  clienteFornecedorId?: number
  tipoEndereco: 'Residencial' | 'Comercial' | 'Cobrança' | 'Inscrição'
  rua?: string
  uf?: string
  cidadeId?: number
  numero?: string
  bairro?: string
  cep?: string
  inscricaoEstadual?: string
  complemento?: string
  observacao?: string
  nomeCidade?: string
}

export interface EstruturaTorneio {
  id: number
  descricao: string
  blindId?: number // Chave estrangeira para associar com Blind
  empresaId: number
}

export interface EstruturaTorneioItem {
  id: number
  descricao: string
  fichas: number
  limiteJogador: boolean
  qtdePorJogador: number
  valorInscricao: number
  taxaAdm: number
  totalInscricao?: number
  tipoRake: '%' | 'R$'
  rake: number
  estruturaId?: number
}

export interface Blind {
  id: number
  descricao: string // Descrição geral dos blinds
  empresaId: number
}

export interface BlindItem {
  id?: number
  nivel: number // Nível dos blinds (1, 2, 3, etc.)
  smallBlind: number // Valor do Small Blind
  bigBlind: number // Valor do Big Blind
  ante: number // Valor do Ante (se houver)
  duracao: number // Duração em minutos de cada nível
  blindId: number // Chave estrangeira para associar com Blind
  order: number
}

export interface Torneio {
  id: number
  descricao: string
  blindId?: number // Chave estrangeira para associar com Blind
  empresaId: number
  estruturaId?: number
  dataInicio?: Date
  status?: 'Criado' | 'parado' | 'em andamento' | 'finalizado'
  nivelAtualOrder?: number
  tempoRestanteNivel?: number
  blindItem?: any
}

export interface TorneioItem {
  id: number
  descricao: string
  fichas: number
  limiteJogador: boolean
  qtdePorJogador: number
  valorInscricao: number
  taxaAdm: number
  totalInscricao?: number
  tipoRake?: '%' | 'R$'
  rake: number
  torneioId?: number // Chave estrangeira para associar com Torneio
}

export interface TorneioBlindItem {
  id?: number
  nivel: number // Nível dos blinds (1, 2, 3, etc.)
  smallBlind: number // Valor do Small Blind
  bigBlind: number // Valor do Big Blind
  ante: number // Valor do Ante (se houver)
  duracao: number // Duração em minutos de cada nível
  order: number // Ordem dos itens de blind
  torneioId: number // Chave estrangeira para associar com Torneio
}

export interface Ticket {
  id: number
  uid?: string
  torneioId?: number
  torneioItemId?: number
  clienteId?: number
  clienteIdPagou?: number
  valorInscricao?: number
  taxaAdm?: number
  rake?: number
  fichas?: number
  usuarioId?: number
  empresaId?: number
  metodoPagamento?: 'Pagamento' | 'Crédito na Conta'
  status?: 'DISPONÍVEL' | 'PENDENTE' | 'CANCELADO' | 'UTILIZADO'
  ClienteFornecedor_razaoSocialNome?: string
  torneioItem_descricao?: string
}

export interface TicketHistorico {
  id?: number
  ticketId: number
  descricao: string
  data: Date
  usuarioId: number
  status: 'DISPONÍVEL' | 'PENDENTE' | 'CANCELADO' | 'UTILIZADO'
}

export interface Laboratorio {
  id: number
  nome: string
  responsavelTecnico?: string
  registroCRQ?: string
  ativo: 'Sim' | 'Não'
  nomeTemplateProposta?: string
  fileTemplateProposta?: string
}

export interface Analise {
  id: number
  laboratorioId: number
  nome: string
  metodo?: string
  unidade?: string
}

export interface TabelaPreco {
  id: number
  laboratorioId: number
  normaId: number
  nome: string
  valor: number
  ativa: 'Sim' | 'Não'
  norma_descricao?: string
}

export interface TabelaPrecoItem {
  id: number
  tabelaPrecoId: number
  analiseId: number
  prazoDias: number
  vpmMinimo?: number
  vpmMaximo?: number
  lqMinimo?: number
  lqMaximo?: number
  valor: number
  analise_nome?: string
  analise_metodo?: string
  analise_unidade?: string
  tabelaPreco_normaId?: number
}

export interface PropostaComercial {
  id: number
  empresaId: number
  clienteFornecedorId: number
  laboratorioId: number
  matrizId?: number
  especificacao?: string

  numero: string
  data: Date
  validade?: Date

  // Snapshot cliente
  clienteNome: string
  clienteDocumento: string
  clienteEmail?: string
  clienteTelefone?: string
  clienteContato?: string

  // Snapshot endereço
  enderecoRua?: string
  enderecoNumero?: string
  enderecoBairro?: string
  enderecoCidade?: string
  enderecoUf?: string
  enderecoCep?: string

  valorTotal: number

  status: 'Rascunho' | 'Enviada' | 'Aprovada' | 'Reprovada' | 'Cancelada' | 'Expirada'

  observacao?: string
  quantidadeAmostras?: number
}

export interface PropostaComercialItem {
  id: number
  propostaComercialId?: number
  analiseId: number
  tabelaPrecoId?: number
  tabelaPrecoItemId?: number
  normaId?: number

  // Snapshot análise
  analiseNome: string
  metodo?: string
  unidade?: string

  prazoDias?: number

  vpmMinimo?: number
  vpmMaximo?: number
  lqMinimo?: number
  lqMaximo?: number

  quantidade: number
  valorUnitario: number
  valorTotal: number
}

export type ProtocoloStatus =
  | 'Protocolado'
  | 'Recebido'
  | 'Em análise'
  | 'Finalizado'
  | 'Cancelado'

export interface Protocolo {
  id: number
  propostaComercialId: number
  empresaId: number
  clienteFornecedorId: number
  laboratorioId: number
  matrizId?: number
  especificacao?: string

  numero: string
  data: Date
  validade?: Date

  clienteNome: string
  clienteDocumento: string
  clienteEmail?: string
  clienteTelefone?: string
  clienteContato?: string

  enderecoRua?: string
  enderecoNumero?: string
  enderecoBairro?: string
  enderecoCidade?: string
  enderecoUf?: string
  enderecoCep?: string

  laboratorioNome?: string
  matrizDescricao?: string

  valorTotal?: number
  status: ProtocoloStatus

  observacao?: string
  quantidadeAmostras: number

  /** flatten getRegistros — PropostaComercial.numero */
  proposta_numero?: string
  cliente_nomeFantasia?: string
  laboratorio_nome?: string
}

export interface ProtocoloItem {
  id: number
  protocoloId?: number
  analiseId: number
  tabelaPrecoId: number
  tabelaPrecoItemId: number
  normaId?: number

  analiseNome: string
  metodo?: string
  unidade?: string

  prazoDias?: number

  vpmMinimo?: number
  vpmMaximo?: number
  lqMinimo?: number
  lqMaximo?: number

  quantidade: number
  valorUnitario: number
  valorTotal: number

  norma_descricao?: string
}

export interface Norma {
  id: number
  descricao: string
}

export interface Matriz {
  id: number
  laboratorioId: number
  descricao: string
}
