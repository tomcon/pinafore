import { get, paramsString } from '../ajax'
import { basename } from './utils'

function getTimelineUrlPath(timeline) {
  switch (timeline) {
    case 'local':
    case 'federated':
      return 'timelines/public'
    case 'home':
      return 'timelines/home'
  }
  if (timeline.startsWith('tag/')) {
    return 'timelines/tag'
  } else if (timeline.startsWith('account/')) {
    return 'accounts'
  }
}

export function getTimeline(instanceName, accessToken, timeline, maxId, since) {
  let timelineUrlName = getTimelineUrlPath(timeline)
  let url = `${basename(instanceName)}/api/v1/${timelineUrlName}`

  if (timeline.startsWith('tag/')) {
    url += '/' + timeline.split('/').slice(-1)[0]
  } else if (timeline.startsWith('account/')) {
    url += '/' + timeline.split('/').slice(-1)[0] +'/statuses'
  }

  let params = {}
  if (since) {
    params.since = since
  }

  if (maxId) {
    params.max_id = maxId
  }

  if (timeline === 'local') {
    params.local = true
  }

  url += '?' + paramsString(params)

  return get(url, {
    'Authorization': `Bearer ${accessToken}`
  })
}