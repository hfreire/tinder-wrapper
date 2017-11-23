/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable promise/no-callback-in-promise */

const { TinderNotAuthorizedError, TinderOutOfLikesError } = require('../src/errors')

describe('Tinder Wrapper', () => {
  let subject
  let Request

  before(() => {
    Request = td.constructor([ 'get', 'post' ])
  })

  afterEach(() => td.reset())

  describe('when constructing', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should set default request headers', () => {
      const captor = td.matchers.captor()

      td.verify(new Request(captor.capture()))

      const options = captor.value
      options.should.have.nested.property('request.headers.User-Agent', 'Tinder Android Version 4.5.5')
      options.should.have.nested.property('request.headers.os_version', '23')
      options.should.have.nested.property('request.headers.platform', 'android')
      options.should.have.nested.property('request.headers.app-version', '854')
      options.should.have.nested.property('request.headers.Accept-Language', 'en')
    })
  })

  describe('when constructing and loading request-on-steroids', () => {
    beforeEach(() => {
      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should create a request with get function', () => {
      subject._request.should.have.property('get')
      subject._request.get.should.be.instanceOf(Function)
    })

    it('should create a request with post function', () => {
      subject._request.should.have.property('post')
      subject._request.get.should.be.instanceOf(Function)
    })
  })

  describe('when authorizing', () => {
    const facebookAccessToken = 'my-facebook-access-token'
    const facebookUserId = 'my-facebook-user-id'
    const statusCode = 200
    const token = 'my-token'
    const body = { token }
    const response = { statusCode, body }

    beforeEach(() => {
      td.when(Request.prototype.post(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()

      return subject.authorize(facebookAccessToken, facebookUserId)
    })

    it('should do a post request to https://api.gotinder.com/auth', () => {
      const captor = td.matchers.captor()

      td.verify(Request.prototype.post(captor.capture()), { ignoreExtraArgs: true, times: 1 })

      const options = captor.value
      options.should.have.property('url', 'https://api.gotinder.com/auth')
    })

    it('should do a post request with body', () => {
      const captor = td.matchers.captor()

      td.verify(Request.prototype.post(captor.capture()), { ignoreExtraArgs: true, times: 1 })

      const options = captor.value
      options.should.have.nested.property('body.facebook_token', facebookAccessToken)
      options.should.have.nested.property('body.facebook_id', facebookUserId)
      options.should.have.nested.property('body.locale', 'en')
    })

    it('should set authentication token', () => {
      subject.authToken.should.be.equal(token)
    })
  })

  describe('when authorizing with invalid facebook access token and user id', () => {
    const facebookAccessToken = undefined
    const facebookUserId = undefined

    beforeEach(() => {
      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with invalid arguments error', (done) => {
      subject.authorize(facebookAccessToken, facebookUserId)
        .catch((error) => {
          error.should.be.instanceOf(Error)
          error.message.should.be.equal('invalid arguments')

          done()
        })
    })
  })

  describe('when getting recommendations', () => {
    const statusCode = 200
    const body = {}
    const response = { statusCode, body }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should do a get request to https://api.gotinder.com/user/recs', () => {
      return subject.getRecommendations()
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.get(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', 'https://api.gotinder.com/user/recs')
        })
    })

    it('should resolve with response body as data', () => {
      return subject.getRecommendations()
        .then((data) => {
          data.should.be.equal(body)
        })
    })
  })

  describe('when getting recommendations and not authorized', () => {
    const statusCode = 401
    const response = { statusCode }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve()
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.getRecommendations()
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when getting recommendations without an access token', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.getRecommendations()
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when getting account', () => {
    const statusCode = 200
    const body = {}
    const response = { statusCode, body }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should do a get request to https://api.gotinder.com/meta', () => {
      return subject.getAccount()
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.get(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', 'https://api.gotinder.com/meta')
        })
    })

    it('should resolve with response body as data', () => {
      return subject.getAccount()
        .then((data) => {
          data.should.be.equal(body)
        })
    })
  })

  describe('when getting account and not authorized', () => {
    const statusCode = 401
    const response = { statusCode }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve()
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.getAccount()
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when getting account without an access token', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.getAccount()
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when getting user', () => {
    const userId = 'my-user-id'
    const statusCode = 200
    const body = {}
    const response = { statusCode, body }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should do a get request to https://api.gotinder.com/user/my-user-id', () => {
      return subject.getUser(userId)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.get(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', 'https://api.gotinder.com/user/my-user-id')
        })
    })

    it('should resolve with response body as data', () => {
      return subject.getUser(userId)
        .then((data) => {
          data.should.be.equal(body)
        })
    })
  })

  describe('when getting user and not authorized', () => {
    const statusCode = 401
    const response = { statusCode }
    const authToken = 'my-access-token'
    const userId = 'my-user-id'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve()
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.getUser(userId)
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when getting user without an access token', () => {
    const userId = 'my-user-id'

    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.getUser(userId)
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when getting user with invalid id', () => {
    const userId = undefined

    beforeEach(() => {
      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with invalid arguments error', (done) => {
      subject.getUser(userId)
        .catch((error) => {
          error.should.be.instanceOf(Error)
          error.message.should.be.equal('invalid arguments')

          done()
        })
    })
  })

  describe('when getting updates with a last activity date', () => {
    const lastActivityDate = new Date()
    const statusCode = 200
    const body = {}
    const response = { statusCode, body }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.post(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should do a post request to https://api.gotinder.com/updates', () => {
      return subject.getUpdates(lastActivityDate)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.post(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', 'https://api.gotinder.com/updates')
        })
    })

    it('should do a post request with body', () => {
      return subject.getUpdates(lastActivityDate)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.post(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.nested.property('body.last_activity_date', lastActivityDate.toISOString())
        })
    })

    it('should resolve with response body as data', () => {
      return subject.getUpdates(lastActivityDate)
        .then((data) => {
          data.should.be.equal(body)
        })
    })
  })

  describe('when getting updates without a last activity date', () => {
    const statusCode = 200
    const body = {}
    const response = { statusCode, body }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.post(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should do a post request to https://api.gotinder.com/updates', () => {
      return subject.getUpdates()
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.post(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', 'https://api.gotinder.com/updates')
        })
    })

    it('should do a post request with body', () => {
      return subject.getUpdates()
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.post(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.nested.property('body.last_activity_date', '')
        })
    })

    it('should resolve with response body as data', () => {
      return subject.getUpdates()
        .then((data) => {
          data.should.be.equal(body)
        })
    })
  })

  describe('when getting updates with invalid last activity date', () => {
    const lastActivityDate = null

    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with invalid arguments error', (done) => {
      subject.getUpdates(lastActivityDate)
        .catch((error) => {
          error.should.be.instanceOf(Error)
          error.message.should.be.equal('invalid arguments')

          done()
        })
    })
  })

  describe('when getting updates and not authorized', () => {
    const statusCode = 401
    const response = { statusCode }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.post(td.matchers.anything(), td.callback(response))).thenResolve()
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.getUpdates()
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when getting updates without an access token', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.getUpdates()
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when sending message', () => {
    const matchId = 'my-match-id'
    const message = 'my-message'
    const statusCode = 200
    const body = {}
    const response = { statusCode, body }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.post(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should do a post request to https://api.gotinder.com/user/matches/my-match-id', () => {
      return subject.sendMessage(matchId, message)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.post(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', 'https://api.gotinder.com/user/matches/my-match-id')
        })
    })

    it('should do a post request with body', () => {
      return subject.sendMessage(matchId, message)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.post(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.nested.property('body.message', message)
        })
    })

    it('should resolve with response body as data', () => {
      return subject.sendMessage(matchId, message)
        .then((data) => {
          data.should.be.equal(body)
        })
    })
  })

  describe('when sending message with invalid match id and message', () => {
    const matchId = undefined
    const message = undefined

    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with invalid arguments error', (done) => {
      subject.sendMessage(matchId, message)
        .catch((error) => {
          error.should.be.instanceOf(Error)
          error.message.should.be.equal('invalid arguments')

          done()
        })
    })
  })

  describe('when sending message and not authorized', () => {
    const statusCode = 401
    const response = { statusCode }
    const authToken = 'my-access-token'
    const matchId = 'my-match-id'
    const message = 'my-message'

    beforeEach(() => {
      td.when(Request.prototype.post(td.matchers.anything(), td.callback(response))).thenResolve()
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.sendMessage(matchId, message)
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when sending message without an access token', () => {
    const matchId = 'my-match-id'
    const message = 'my-message'

    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.sendMessage(matchId, message)
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when liking', () => {
    const userId = 'my-user-id'
    const photoId = 'my-photo-id'
    const contentHash = 'my-content-hash'
    const sNumber = 'my-s-number'
    const statusCode = 200
    const body = { likes_remaining: 100 }
    const response = { statusCode, body }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should do a get request to https://api.gotinder.com/like/my-user-id?photoId=my-photo-id&content_hash=my-content-hash&s_number=my-s-number', () => {
      return subject.like(userId, photoId, contentHash, sNumber)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.get(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', 'https://api.gotinder.com/like/my-user-id?photoId=my-photo-id&content_hash=my-content-hash&s_number=my-s-number')
        })
    })

    it('should resolve with response body as data', () => {
      return subject.like(userId, photoId, contentHash, sNumber)
        .then((data) => {
          data.should.be.equal(body)
        })
    })
  })

  describe('when liking and out of likes', () => {
    const userId = 'my-user-id'
    const photoId = 'my-photo-id'
    const contentHash = 'my-content-hash'
    const sNumber = 'my-s-number'
    const statusCode = 200
    const body = { likes_remaining: 0 }
    const response = { statusCode, body }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should reject with tinder out of likes error', (done) => {
      subject.like(userId, photoId, contentHash, sNumber)
        .catch((error) => {
          error.should.be.instanceOf(TinderOutOfLikesError)

          done()
        })
    })
  })

  describe('when liking with invalid user id', () => {
    const userId = undefined

    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with invalid arguments error', (done) => {
      subject.like(userId)
        .catch((error) => {
          error.should.be.instanceOf(Error)
          error.message.should.be.equal('invalid arguments')

          done()
        })
    })
  })

  describe('when liking and not authorized', () => {
    const statusCode = 401
    const response = { statusCode }
    const authToken = 'my-access-token'
    const userId = 'my-user-id'
    const photoId = 'my-photo-id'
    const contentHash = 'my-content-hash'
    const sNumber = 'my-s-number'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve()
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.like(userId, photoId, contentHash, sNumber)
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when liking without an access token', () => {
    const userId = 'my-user-id'
    const photoId = 'my-photo-id'
    const contentHash = 'my-content-hash'
    const sNumber = 'my-s-number'

    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.like(userId, photoId, contentHash, sNumber)
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when passing', () => {
    const userId = 'my-user-id'
    const statusCode = 200
    const body = {}
    const response = { statusCode, body }
    const authToken = 'my-access-token'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve(body)
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should do a get request to https://api.gotinder.com/pass/my-user-id', () => {
      return subject.pass(userId)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(Request.prototype.get(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', 'https://api.gotinder.com/pass/my-user-id')
        })
    })

    it('should resolve with response body as data', () => {
      return subject.pass(userId)
        .then((data) => {
          data.should.be.equal(body)
        })
    })
  })

  describe('when passing with invalid user id', () => {
    const userId = undefined

    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with invalid arguments error', (done) => {
      subject.pass(userId)
        .catch((error) => {
          error.should.be.instanceOf(Error)
          error.message.should.be.equal('invalid arguments')

          done()
        })
    })
  })

  describe('when passing and not authorized', () => {
    const statusCode = 401
    const response = { statusCode }
    const authToken = 'my-access-token'
    const userId = 'my-user-id'

    beforeEach(() => {
      td.when(Request.prototype.get(td.matchers.anything(), td.callback(response))).thenResolve()
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
      subject.authToken = authToken
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.pass(userId)
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })

  describe('when passing without an access token', () => {
    const userId = 'my-user-id'

    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      const TinderWrapper = require('../src/tinder-wrapper')
      subject = new TinderWrapper()
    })

    it('should reject with tinder not authorized error', (done) => {
      subject.pass(userId)
        .catch((error) => {
          error.should.be.instanceOf(TinderNotAuthorizedError)

          done()
        })
    })
  })
})
