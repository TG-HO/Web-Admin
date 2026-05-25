"use client"

import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSurveyReports } from '@/hooks/useQueries'

export default function SurveyReportsPage() {
  const params = useParams() as { id?: string }
  const surveyId = params.id
  const { data: reports, isLoading } = useSurveyReports(surveyId)

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading reports...</div>
            ) : reports && reports.length === 0 ? (
              <div className="text-muted-foreground">No reports for this survey.</div>
            ) : (
              <ul className="space-y-2">
                {reports?.map((r) => (
                  <li key={r.id} className="border rounded p-2 text-sm">
                    <div>Reporter: {r.reporter_id}</div>
                    <div>Reason: {r.reason}</div>
                    <div className="text-xs text-muted-foreground">{r.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
