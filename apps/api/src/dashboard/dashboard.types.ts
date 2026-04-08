export interface DashboardResponse {
    newMatchesToday: number
    bestMatch: {
        id: string
        jobTitle: string
        company: string
        location: string
        matchScore: number
        matchRationale: string
        jobUrl: string
    } | null
    otherNewMatches: Array<{
        id: string
        jobTitle: string
        company: string
        matchScore: number
    }>
    thisWeek: {
        evaluated: number
        matched: number
        avgScore: number
        digestsSent: number
    }
    lastWeek: {
        evaluated: number
        matched: number
        avgScore: number
    }
}
