// src/components/FormattedDateTime.tsx
import React from 'react'

interface FormattedDateTimeProps {
  date?: string | Date | null
}

const FormattedDateTime: React.FC<FormattedDateTimeProps> = ({ date }) => {
  if (!date) return <span>-</span>

  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const formattedTime = new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <span>
      {formattedDate} {formattedTime}
    </span>
  )
}

export default FormattedDateTime
