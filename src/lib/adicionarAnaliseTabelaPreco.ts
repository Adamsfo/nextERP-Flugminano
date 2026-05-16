import { apiGeral } from '@/lib/geral'
import { Norma, TabelaPrecoItem } from '@/types/geral'

export const MSG_QTDE_ANALISES_MAIOR_AMOSTRAS =
  'Quantidade de análises não pode ser maior que a de amostras'

/** Espelha o onChange do campo "Qtde de Análises" da Proposta Comercial. */
export function processarQuantidadeAnalisesInput(
  rawValue: string,
  quantidadeAmostras?: number
): { quantidade: number; error: string } {
  if (rawValue === '') {
    return { quantidade: 0, error: '' }
  }

  let numero = Number(rawValue)
  if (Number.isNaN(numero)) {
    return { quantidade: 0, error: '' }
  }

  if (numero < 0) numero = 0

  if (quantidadeAmostras !== undefined) {
    const qtdAmostras = Number(quantidadeAmostras || 0)

    if (qtdAmostras > 0 && numero > qtdAmostras) {
      return {
        quantidade: qtdAmostras,
        error: MSG_QTDE_ANALISES_MAIOR_AMOSTRAS,
      }
    }
  }

  return { quantidade: numero, error: '' }
}

/** Incremento do botão "+" — mesma regra da proposta. */
export function incrementarQuantidadeAnalises(
  prev: number | null,
  quantidadeAmostras?: number
): { quantidade: number; error: string } {
  const novo = (prev || 0) + 1

  if (quantidadeAmostras !== undefined) {
    const qtdAmostras = Number(quantidadeAmostras || 0)

    if (qtdAmostras > 0 && novo > qtdAmostras) {
      return {
        quantidade: qtdAmostras,
        error: MSG_QTDE_ANALISES_MAIOR_AMOSTRAS,
      }
    }
  }

  return { quantidade: novo, error: '' }
}

export type ItemBaseTabelaPreco = {
  id: number
  analiseId: number
  tabelaPrecoId: number
  tabelaPrecoItemId: number
  analiseNome: string
  metodo?: string
  unidade?: string
  prazoDias?: number
  vpmMinimo?: number
  vpmMaximo?: number
  lqMinimo?: number
  lqMaximo?: number
  normaId?: number
  norma_descricao?: string
  valorUnitario: number
}

/** Monta itens a partir da tabela de preço (igual Proposta Comercial). */
export async function mapRegistrosTabelaPrecoToItensBase(
  registros: TabelaPrecoItem[]
): Promise<ItemBaseTabelaPreco[]> {
  let normaidTemp: number | undefined
  let norma: Norma | undefined

  return Promise.all(
    registros.map(async (registro) => {
      if (registro.tabelaPreco_normaId != normaidTemp) {
        norma = (await apiGeral.getResourceById<Norma>(
          '/norma',
          registro.tabelaPreco_normaId!
        )) as Norma
        normaidTemp = registro.tabelaPreco_normaId
      }

      return {
        id: 0,
        analiseId: registro.analiseId,
        tabelaPrecoId: registro.tabelaPrecoId,
        tabelaPrecoItemId: registro.id,
        analiseNome: registro.analise_nome || '',
        metodo: registro.analise_metodo,
        unidade: registro.analise_unidade,
        prazoDias: registro.prazoDias,
        vpmMinimo: registro.vpmMinimo,
        vpmMaximo: registro.vpmMaximo,
        lqMinimo: registro.lqMinimo,
        lqMaximo: registro.lqMaximo,
        normaId: registro.tabelaPreco_normaId,
        norma_descricao: norma?.descricao || '',
        valorUnitario: Number(registro.valor) || 0,
      }
    })
  )
}

/** Proposta: uma linha por registro; quantidade/valorTotal = Qtde de Análises × valor unitário. */
export function montarItensPropostaComercial<T extends { quantidade: number; valorTotal: number }>(
  bases: ItemBaseTabelaPreco[],
  qtdeAnalises: number,
  extra: Record<string, unknown> = {}
): T[] {
  const q = quantidadeAnalisesValida(qtdeAnalises)
  return bases.map(
    (base) =>
      ({
        ...base,
        ...extra,
        quantidade: q,
        valorTotal: Number((q * base.valorUnitario).toFixed(2)),
      }) as unknown as T
  )
}

export function quantidadeAnalisesValida(qtdeAnalises: number | null | undefined): number {
  const n = Number(qtdeAnalises ?? 0)
  return Number.isFinite(n) && n >= 1 ? n : 0
}
