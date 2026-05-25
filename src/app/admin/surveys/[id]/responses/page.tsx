"use client"

import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSurveyResponses } from '@/hooks/useQueries'

export default function SurveyResponsesPage() {
  const params = useParams() as { id?: string }
  const surveyId = params.id
  const { data: responses, isLoading } = useSurveyResponses(surveyId)

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading responses...</div>
            ) : responses && responses.length === 0 ? (
              <div className="text-muted-foreground">No responses yet.</div>
            ) : (
              <ul className="space-y-2">
                {responses?.map((r) => (
                  <li key={r.id} className="border rounded p-2 text-sm">
                    <div>Responder: {r.responder_id}</div>
                    <div>Submitted: {r.submitted_at}</div>
                    <div className="text-xs text-muted-foreground">{JSON.stringify(r.responses)}</div>
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
