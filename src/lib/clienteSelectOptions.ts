export type ClienteSelectOption = {
  value: number
  label: string
  selected: boolean
}

export type ClienteSelectFallback = {
  value: number
  label: string
}

/** Garante que o ID selecionado exista nas options com selected: true (CMultiSelect exige isso). */
export function ensureClienteSelectOption(
  options: ClienteSelectOption[],
  selectedId?: number | null,
  fallback?: ClienteSelectFallback | null
): ClienteSelectOption[] {
  if (!selectedId || selectedId <= 0) {
    return options.map((o) => ({ ...o, selected: false }))
  }

  const exists = options.some((o) => o.value === selectedId)
  if (exists) {
    return options.map((o) => ({
      ...o,
      selected: o.value === selectedId,
    }))
  }

  if (fallback?.value === selectedId && fallback.label.trim()) {
    return [
      { value: fallback.value, label: fallback.label.trim(), selected: true },
      ...options.map((o) => ({ ...o, selected: false })),
    ]
  }

  return options.map((o) => ({ ...o, selected: false }))
}
