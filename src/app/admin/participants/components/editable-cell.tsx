'use client'

import { useState } from 'react'

export function EditableCell({ id, field, value, options, onUpdate }: {
    id: string, field: string, value: string, options: string[],
    onUpdate: (id: string, field: string, value: string) => void
}) {
    const [currentValue, setCurrentValue] = useState(value || '')
    const [updating, setUpdating] = useState(false)

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value
        setCurrentValue(newValue)
        setUpdating(true)
        await onUpdate(id, field, newValue)
        setUpdating(false)
    }

    return (
        <select
            value={currentValue}
            onChange={handleChange}
            disabled={updating}
            className={`w-full bg-transparent border-none text-sm focus:ring-0 cursor-pointer ${updating ? 'opacity-50' : ''}`}
        >
            <option value="">-</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    )
}
