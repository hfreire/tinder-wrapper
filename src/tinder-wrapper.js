/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const BASE_URL = 'https://api.gotinder.com'

const _ = require('lodash')
const Promise = require('bluebird')

const { TinderNotAuthorizedError, TinderOutOfLikesError } = require('./errors')

const Request = require('request-on-steroids')

const responseHandler = ({ statusCode, statusMessage, body }) => {
  if (statusCode >= 300) {
    switch (statusCode) {
      case 401:
        throw new TinderNotAuthorizedError()
      default:
        throw new Error(`${statusCode} ${statusMessage}`)
    }
  }

  if (body && body.status && body.status !== 200) {
    throw new Error(`${body.status} ${body.error}`)
  }

  return body
}

const defaultOptions = {
  'request-on-steroids': {
    request: {
      headers: {
        'User-Agent': 'Tinder Android Version 4.5.5',
        'os_version': '23',
        'platform': 'android',
        'app-version': '854',
        'Accept-Language': 'en'
      }
    },
    perseverance: {
      retry: {
        max_tries: 2,
        interval: 1000,
        timeout: 16000,
        throw_original: true,
        predicate: (error) => !(error instanceof TinderNotAuthorizedError)
      },
      breaker: { timeout: 12000, threshold: 80, circuitDuration: 3 * 60 * 60 * 1000 }
    }
  }
}

class TinderWrapper {
  constructor (options = {}) {
    this._options = _.defaultsDeep(options, defaultOptions)

    this._request = new Request(_.get(this._options, 'request-on-steroids'))
  }

  set authToken (authToken) {
    this._authToken = authToken
  }

  get authToken () {
    return this._authToken
  }

  get circuitBreaker () {
    return this._request.circuitBreaker
  }

  authorize (facebookAccessToken, facebookUserId) {
    return Promise.try(() => {
      if (!facebookAccessToken || !facebookUserId) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => {
        const options = {
          url: `${BASE_URL}/auth`,
          body: {
            facebook_token: facebookAccessToken,
            facebook_id: facebookUserId,
            locale: 'en'
          },
          json: true
        }

        return this._request.post(options, responseHandler)
          .then((data) => {
            this._authToken = data.token

            return data
          })
      })
  }

  getRecommendations () {
    return Promise.try(() => {
      if (!this._authToken) {
        throw new TinderNotAuthorizedError()
      }
    })
      .then(() => {
        const options = {
          url: `${BASE_URL}/user/recs`,
          headers: {
            'X-Auth-Token': this._authToken
          },
          json: true
        }

        return this._request.get(options, responseHandler)
      })
  }

  getAccount () {
    return Promise.try(() => {
      if (!this._authToken) {
        throw new TinderNotAuthorizedError()
      }
    })
      .then(() => {
        const options = {
          url: `${BASE_URL}/meta`,
          headers: {
            'X-Auth-Token': this._authToken
          },
          json: true
        }

        return this._request.get(options, responseHandler)
      })
  }

  getUser (userId) {
    return Promise.try(() => {
      if (!userId) {
        throw new Error('invalid arguments')
      }

      if (!this._authToken) {
        throw new TinderNotAuthorizedError()
      }
    })
      .then(() => {
        const options = {
          url: `${BASE_URL}/user/${userId}`,
          headers: {
            'X-Auth-Token': this._authToken
          },
          json: true
        }

        return this._request.get(options, responseHandler)
      })
  }

  getUpdates (lastActivityDate = '') {
    return Promise.try(() => {
      if (!(lastActivityDate instanceof Date) && !(lastActivityDate instanceof String || lastActivityDate === '')) {
        throw new Error('invalid arguments')
      }

      if (!this._authToken) {
        throw new TinderNotAuthorizedError()
      }
    })
      .then(() => {
        let _lastActivityDate = lastActivityDate
        if (lastActivityDate instanceof Date) {
          _lastActivityDate = lastActivityDate.toISOString()
        }

        const options = {
          url: `${BASE_URL}/updates`,
          headers: {
            'X-Auth-Token': this._authToken
          },
          body: {
            last_activity_date: _lastActivityDate
          },
          json: true
        }

        return this._request.post(options, responseHandler)
      })
  }

  sendMessage (matchId, message) {
    return Promise.try(() => {
      if (!matchId || !message) {
        throw new Error('invalid arguments')
      }

      if (!this._authToken) {
        throw new TinderNotAuthorizedError()
      }
    })
      .then(() => {
        const options = {
          url: `${BASE_URL}/user/matches/${matchId}`,
          headers: {
            'X-Auth-Token': this._authToken
          },
          body: { message },
          json: true
        }

        return this._request.post(options, responseHandler)
      })
  }

  like (userId, photoId, contentHash, sNumber) {
    return Promise.try(() => {
      if (!userId) {
        throw new Error('invalid arguments')
      }

      if (!this._authToken) {
        throw new TinderNotAuthorizedError()
      }
    })
      .then(() => {
        const options = {
          url: `${BASE_URL}/like/${userId}?photoId=${photoId}&content_hash=${contentHash}&s_number=${sNumber}`,
          headers: {
            'X-Auth-Token': this._authToken
          },
          json: true
        }

        return this._request.get(options, responseHandler)
          .then((data) => {
            if (data && !data.likes_remaining) {
              throw new TinderOutOfLikesError()
            }

            return data
          })
      })
  }

  pass (userId) {
    return Promise.try(() => {
      if (!userId) {
        throw new Error('invalid arguments')
      }

      if (!this._authToken) {
        throw new TinderNotAuthorizedError()
      }
    })
      .then(() => {
        const options = {
          url: `${BASE_URL}/pass/${userId}`,
          headers: {
            'X-Auth-Token': this._authToken
          },
          json: true
        }

        return this._request.get(options, responseHandler)
      })
  }
}

module.exports = TinderWrapper
