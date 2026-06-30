'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  total: number
  success: number
  errors: number
  avgDuration: number
  successRate: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data.stats)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <p>Chargement...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-slate-900">
              Tableau de bord
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Statistiques d'analyse
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Analyser
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="text-sm text-slate-600">Analyses totales</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats?.total || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="text-sm text-slate-600">Succès</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats?.success || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="text-sm text-slate-600">Erreurs</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {stats?.errors || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="text-sm text-slate-600">Taux de succès</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats?.successRate || 0}%
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-bold text-slate-900">
            Durée moyenne
          </h2>
          <p className="mt-2 text-4xl font-bold text-slate-900">
            {stats?.avgDuration || 0}ms
          </p>
          <p className="mt-1 text-sm text-slate-600">par analyse</p>
        </div>
      </div>
    </main>
  )
}
