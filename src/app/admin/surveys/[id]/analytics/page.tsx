"use client"

import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSurveyResponses } from '@/hooks/useQueries'

export default function SurveyAnalyticsPage() {
  const params = useParams() as { id?: string }
  const surveyId = params.id
  const { data: responses, isLoading } = useSurveyResponses(surveyId)

  const total = responses ? responses.length : 0

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading analytics...</div>
            ) : (
              <div className="space-y-2">
                <div>Total responses: {total}</div>
                <div>Unique responders: {new Set((responses || []).map(r => r.responder_id)).size}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
