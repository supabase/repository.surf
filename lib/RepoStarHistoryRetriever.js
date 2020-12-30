import { getRepositoryStarHistory, uuid } from 'lib/helpers'

export default class RepoStarHistoryRetriever {
  constructor(supabase, starsTable, organization, repoName, githubAccessToken) {
    this.supabase = supabase
    this.starsTable = starsTable
    this.organization = organization
    this.repoName = repoName
    this.githubAccessToken = githubAccessToken
    this.starHistory = []
    this.historyUpdateTime = null
    this.isLoading = true
    this.totalStarCount = null
    this.subscriptions = new Map()

    this._loadStarHistory()
  }

  async _loadStarHistory(){
    const {starHistory, historyUpdateTime, totalStarCount} =
      await getRepositoryStarHistory(
        this.supabase, this.starsTable, this.organization,
        this.repoName, this.githubAccessToken, this._handleUpdate
      )
    this.starHistory = starHistory
    this.historyUpdateTime = historyUpdateTime
    this.isLoading = false
    this.totalStarCount = totalStarCount
    this._notifyAllSubscribers()
  }

  // A function for handling intermediate results.
  // This should be called once every 10 API calls.
  _handleUpdate = (starHistory, totalStarCount) => {
    this.starHistory = starHistory
    this.isLoading = false
    this.totalStarCount = totalStarCount
    this._notifyAllSubscribers()
  }

  _notifyAllSubscribers() {
    this.subscriptions.forEach((x) => 
      x.callback(this.starHistory, this.historyUpdateTime, this.isLoading, this.totalStarCount)
    )
  }

  onLoaded(callback){
    try {
      const id = uuid()
      let self = this
      const subscription = {
        callback,
        unsubscribe: () => {
          self.subscriptions.delete(id)
        },
      }
      this.subscriptions.set(id, subscription)
      return { subscription, error: null }
    } catch (error) {
      console.log(error)
      return { subscription: null, error }
    }
  }
}
