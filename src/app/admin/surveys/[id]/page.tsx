"use client"

import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSurveyDetail, useDownSurveyMutation, useDeleteSurveyMutation, useRestoreSurveyMutation } from '@/hooks/useQueries'
import { formatDate, formatCurrency, getSurveyReward } from '@/utils'

export default function SurveyDetailPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const surveyId = params.id
  const { data: survey, isLoading } = useSurveyDetail(surveyId || '')
  const downMutation = useDownSurveyMutation();
  const restoreMutation = useRestoreSurveyMutation();
  const deleteMutation = useDeleteSurveyMutation();

  if (isLoading) return <DashboardLayout><div className="p-6">Loading survey...</div></DashboardLayout>

  if (!survey) return <DashboardLayout><div className="p-6">Survey not found.</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{survey.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{survey.description}</p>
            <p className="text-sm">Reward: {formatCurrency(getSurveyReward(survey))}</p>
            <p className="text-sm">Responses: {survey.total_responses_collected ?? 0} / {survey.target_responses ?? '-'}</p>
            <p className="text-sm">Published: {survey.published_at ? formatDate(survey.published_at) : '-'}</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => router.push(`/admin/surveys/${survey.id}/responses`)}>Responses</Button>
              <Button onClick={() => router.push(`/admin/surveys/${survey.id}/analytics`)}>Analytics</Button>
              <Button onClick={() => router.push(`/admin/surveys/${survey.id}/reports`)}>Reports</Button>
              {survey.status !== 'downed' && (
                <Button
                  className="text-red-600"
                  onClick={() =>
                    downMutation.mutate(survey.id, {
                      onSuccess: () => {
                        router.refresh();
                      },
                      onError: (err) => alert(err instanceof Error ? err.message : 'Unable to down survey'),
                    })
                  }
                >
                  Down
                </Button>
              )}
              {survey.status === 'downed' && (
                <Button
                  className="text-green-600"
                  onClick={() =>
                    restoreMutation.mutate(survey.id, {
                      onSuccess: () => router.refresh(),
                      onError: (err) => alert(err instanceof Error ? err.message : 'Unable to restore'),
                    })
                  }
                >
                  Restore
                </Button>
              )}
              <Button
                className="text-red-600"
                onClick={() =>
                  deleteMutation.mutate(survey.id, {
                    onSuccess: () => router.push('/admin/surveys'),
                    onError: (err) => alert(err instanceof Error ? err.message : 'Unable to delete'),
                  })
                }
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
