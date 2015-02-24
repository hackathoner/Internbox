oauth-toolkit
==================

[RFC-5849](http://tools.ietf.org/html/rfc5849) complaint oauth toolkit.

Yeah, yet another OAuth toolkit for node.js.

Most of npm modules are not 100% complaint to RFC-5849. These modules
are failing on example of the spec. Especially when there are multiple
parameters with same key like a=1&a=2, these modules overwrites former
parameters with later parameters, and it results to wrong base string.
And there is also a case that sort algorithm in parameter normalization
deviates from the spec.

This module provides low level API for calculating oauth signature to
present and validate the steps described in the specification. It may
not fit your purpose if you are looking for a convinient oauth library.

### Install

```sh
npm install oauth-toolkit
```

### Usage

```js

var oauth = require('oauth-toolkit');

var signature = oauth.signature(
    'POST', // requestMethod
    'http://example.com/request?b5=%3D%253D&a3=a&c%40=&a2=r%20b', // url
    'c2&a3=2+q', // body
    {
        consumerKey: '9djdj82h48djs9d2',
        consumerSecret: 'j49sk3j29djd',
        token: 'kkk9d7dh3k39sjv7',
        tokenSecret: 'dh893hdasih9',
        nonce: '7d8f3e4a',
        signatureMethod: 'HMAC-SHA1',
        timestamp: '137131201',
    }
);

require('assert').equal(signature, 'r6/TJjbCOr97/+UU0NsvSne7s5g=');

```

