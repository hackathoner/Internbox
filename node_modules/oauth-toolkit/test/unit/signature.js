
var assert = require('assert');
var oauth = require('../../');

var commonSpec = function (fixture) {
    it('basestring', function () {
        var basestring = oauth._baseString(
            fixture.request.method, fixture.request.url, fixture.request.body,
            oauth._protocolParameters(fixture.oauth)
        );

        assert.equal(basestring, fixture.expected.basestring);
    });

    it('signature', function () {
        var signature = oauth.signature(
            fixture.request.method,
            fixture.request.url,
            fixture.request.body,
            fixture.oauth
        );

        assert.equal(signature, fixture.expected.signature);
    });
};

describe('oauth-toolkit', function () {
    describe('twitter', function () {
        var fixtures = require('../fixtures/twitter');

        describe('twitter.requestToken', function () {
            commonSpec(fixtures.requestToken);
        });
        describe('twitter.accessToken', function () {
            commonSpec(fixtures.accessToken);
        });
        describe('twitter.statusUpdate', function () {
            commonSpec(fixtures.statusUpdate);
        });
    });

    describe('RFC5849', function () {
        var fixtures = require('../fixtures/rfc5849');

        commonSpec(fixtures.authorizedReq);
    });
});
