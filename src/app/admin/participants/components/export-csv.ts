/* eslint-disable @typescript-eslint/no-explicit-any */
import { exportParticipants } from '../exportAction'
import { toast } from 'sonner'

export async function handleExportCSV(
    search: string, selectedSeminar: string, startDate: string, endDate: string,
    selectedNiche: string, selectedCloseBy: string, selectedState: string
) {
    const res = await exportParticipants(search, selectedSeminar, startDate, endDate, selectedNiche, selectedCloseBy, selectedState)
    if (!res.data || res.data.length === 0) {
        toast.error('Tiada data untuk export')
        return
    }
    const headers = ['Seminar','Name','Phone','Email','Ticket','Day 1','Day 2','Niche','State','Sales','Reg. Date','BDS Invited','BDS Status','Close By','Package','Payment','Day','PIC']
    const rows = res.data.map((p: any) => {
        const c1 = p.checkins?.find((c: any) => c.day === 1)
        const c2 = p.checkins?.find((c: any) => c.day === 2)
        return [p.event_code||'-',p.name||'-',p.phone||'-',p.email||'-',p.ticket_type||'-',
            c1?`Present (${c1.attend_count})`:'-', c2?`Present (${c2.attend_count})`:'-',
            p.niche||'-',p.state||'-',p.total_sales||'-',
            p.registration_date?new Date(p.registration_date).toLocaleDateString():'-',
            p.bds_invited||'-',p.bds_status||'-',p.close_by||'-',p.package||'-',p.payment_status||'-',p.close_day||'-',p.pic||'-']
    })
    const esc = (v: string) => v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v
    const csv = [headers.map(esc).join(','), ...rows.map((r: string[]) => r.map(esc).join(','))].join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `participants_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`${res.data.length} rekod diexport`)
}
