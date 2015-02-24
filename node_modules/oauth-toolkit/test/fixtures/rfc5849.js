exports.authorizedReq = {
    request: {
        method: 'POST',
        url: 'http://example.com/request?b5=%3D%253D&a3=a&c%40=&a2=r%20b',
        body: 'c2&a3=2+q'
    },
    oauth: {
        consumerKey: '9djdj82h48djs9d2',
        consumerSecret: 'j49sk3j29djd',
        token: 'kkk9d7dh3k39sjv7',
        tokenSecret: 'dh893hdasih9',
        nonce: '7d8f3e4a',
        signatureMethod: 'HMAC-SHA1',
        timestamp: '137131201',
    },
    expected: {
        basestring: 'POST&http%3A%2F%2Fexample.com%2Frequest&a2%3Dr%2520b%26a3%3D2%2520q' +
            '%26a3%3Da%26b5%3D%253D%25253D%26c%2540%3D%26c2%3D%26oauth_consumer_' +
            'key%3D9djdj82h48djs9d2%26oauth_nonce%3D7d8f3e4a%26oauth_signature_m' +
            'ethod%3DHMAC-SHA1%26oauth_timestamp%3D137131201%26oauth_token%3Dkkk' +
            '9d7dh3k39sjv7',
        signature: 'r6/TJjbCOr97/+UU0NsvSne7s5g='
    }
};

