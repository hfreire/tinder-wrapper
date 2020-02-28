/*
 * Copyright (c) 2020, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

describe('Module', () => {
  let subject
  let TinderWrapper
  let TinderNotAuthorizedError
  let TinderOutOfLikesError

  before(() => {
    TinderWrapper = td.object()

    TinderNotAuthorizedError = td.object()

    TinderOutOfLikesError = td.object()
  })

  afterEach(() => td.reset())

  describe('when loading', () => {
    beforeEach(() => {
      td.replace('../src/tinder-wrapper', TinderWrapper)

      td.replace('../src/errors', { TinderNotAuthorizedError, TinderOutOfLikesError })

      subject = require('../src/index')
    })

    it('should export tinder wrapper', () => {
      subject.should.have.property('TinderWrapper', TinderWrapper)
    })

    it('should export tinder not authorized error', () => {
      subject.should.have.property('TinderNotAuthorizedError', TinderNotAuthorizedError)
    })

    it('should export tinder out of likes error', () => {
      subject.should.have.property('TinderOutOfLikesError', TinderOutOfLikesError)
    })
  })
})
