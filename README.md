# A :revolving_hearts: Tinder :package: wrapper library

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/hfreire/tinder-wrapper.svg?branch=master)](https://travis-ci.org/hfreire/tinder-wrapper)
[![Coverage Status](https://coveralls.io/repos/github/hfreire/tinder-wrapper/badge.svg?branch=master)](https://coveralls.io/github/hfreire/tinder-wrapper?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/hfreire/tinder-wrapper.svg)](https://greenkeeper.io/)
[![](https://img.shields.io/github/release/hfreire/tinder-wrapper.svg)](https://github.com/hfreire/tinder-wrapper/releases)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/npm/v/tinder-wrapper.svg)](https://www.npmjs.com/package/tinder-wrapper)
[![Downloads](https://img.shields.io/npm/dt/tinder-wrapper.svg)](https://www.npmjs.com/package/tinder-wrapper) 

> A Tinder wrapper library.

### Features
* Retries :shit: failing requests in temporary and unexpected system and :boom: network failures :white_check_mark:
* Uses [Brakes](https://github.com/awolden/brakes) circuit breakers to :hand: fail-fast until it is safe to retry :white_check_mark: 
* Supports [Bluebird](https://github.com/petkaantonov/bluebird) :bird: promises :white_check_mark:

### How to install
```
npm install tinder-wrapper
```

### How to use

#### Use it in your app
Authorize Facebook account and get recommendations
```javascript
const TinderWrapper = require('tinder-wrapper')

const tinder = new TinderWrapper()
const facebookAccessToken = 'my-facebook-access-token'
const facebookUserId = 'my-facebook-id'

tinder.authorize(facebookAccessToken, facebookUserId)
  .then(() => tinder.getRecommendations())
  .then(({ results }) => console.log(results))
```

### Used by
* [get-me-a-date](https://github.com/hfreire/get-me-a-date) - :heart_eyes: Help me get a :cupid: date tonight :first_quarter_moon_with_face:
