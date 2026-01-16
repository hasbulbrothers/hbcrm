import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Card className="w-full max-w-md text-center bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="9X Growth Logo" width={200} height={100} className="object-contain" />
          </div>
          <CardTitle className="text-3xl text-white">9X Growth January 2026</CardTitle>
          <p className="text-gray-400">Sistem Check-In</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/checkin" className="block">
            <Button className="w-full h-12 text-lg bg-yellow-600 hover:bg-yellow-700 text-white font-bold">Check-In Peserta</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
