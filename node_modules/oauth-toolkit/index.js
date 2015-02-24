var url = require('url');
var qs = require('querystring');
var crypto = require('crypto');

var ALPHANUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

function nonce(length, chars) {
    chars = chars || ALPHANUM;
    var result = "";
    for (var i = 0; i < length; i++) {
        var at = Math.floor(Math.random() * chars.length);
        result += chars.charAt(at);
    }
    return result;
}

function timestamp(date) {
    date = date || new Date();
    return Math.floor(date);
}

function encode(s) {
    if (! s) return '';
    return encodeURIComponent(s)
        .replace(/\!/g, "%21")
        .replace(/\*/g, "%2A")
        .replace(/\'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");
}

function protocolParameters(options) {
    var params = {};
    // oauth_consumer_key
    //   The identifier portion of the client credentials (equivalent to
    //   a username).  The parameter name reflects a deprecated term
    //   (Consumer Key) used in previous revisions of the specification,
    //   and has been retained to maintain backward compatibility.
    params.oauth_consumer_key = options.consumerKey;

    // oauth_token
    //   The token value used to associate the request with the resource
    //   owner.  If the request is not associated with a resource owner
    //   (no token available), clients MAY omit the parameter.
    if (options.token) params.oauth_token = options.token;

    // oauth_signature_method
    //   The name of the signature method used by the client to sign the
    //   request, as defined in Section 3.4.
    params.oauth_signature_method = options.signatureMethod.toUpperCase();

    // oauth_timestamp
    //   The timestamp value as defined in Section 3.3.  The parameter
    //   MAY be omitted when using the "PLAINTEXT" signature method.
    if (params.oauth_signature_method !== 'PLAINTEXT')
        params.oauth_timestamp = options.timestamp || timestamp();
    else if (options.timestamp)
        params.oauth_timestamp = params.timestamp;

    // oauth_nonce
    //   The nonce value as defined in Section 3.3.  The parameter MAY
    //   be omitted when using the "PLAINTEXT" signature method.
    if (params.oauth_signature_method !== 'PLAINTEXT')
        params.oauth_nonce = options.nonce || nonce(6);
    else if (options.nonce)
        params.oauth_nonce = options.nonce;

    // oauth_version
    //   OPTIONAL.  If present, MUST be set to "1.0".  Provides the
    //   version of the authentication process as defined in this
    //   specification.
    if (options.version) params.oauth_version = '1.0';

    // Follows are situational
    if (options.callback) params.oauth_callback = options.callback;
    if (options.verifier) params.oauth_verifier = options.verifier;

    return params;
}

//
// Signature Base String
// http://tools.ietf.org/html/rfc5849#section-3.4.1
//
function signatureBaseString(requestMethod, uri, body, protocolParams) {
    return [
        encode(requestMethod.toUpperCase()),
        encode(baseStringUri(uri)),
        encode(normalizedRequestParameters(uri, body, protocolParams))
    ].join('&');
}

//
// Base String URI
// http://tools.ietf.org/html/rfc5849#section-3.4.1.2
//
function baseStringUri(uri) {
    var parsed = url.parse(uri);

    //  The port MUST be included if it is not the default port for the
    //  scheme, and MUST be excluded if it is the default.
    if (parsed.protocol === 'https:/') {
        parsed.host = parsed.host.replace(/:443$/, '');
    } else if (parsed.protocol === 'http:/') {
        parsed.host = parsed.host.replace(/:80$/, '');
    }

    return url.format({
        protocol: parsed.protocol,
        host: parsed.host,
        auth: parsed.auth,
        pathname: parsed.pathname
    });
}

//
// Maps object to bi-dimensional array
//
// @example
// toArray({ foo: 'A', bar: [ 'b', 'B' ]})
// will be
// [ ['foo', 'A'],
//   ['bar', 'b'],
//   ['bar', 'B'] ]
//
function toArray(obj) {
    var key, val, arr = [];
    for (key in obj) {
        val = obj[key];
        if (Array.isArray(val))
            for (var i = 0; i < val.length; i++)
        arr.push([ key, val[i] ]);
        else
            arr.push([ key, val ]);
    }
    return arr;
}

//
// Parameter Sources
// http://tools.ietf.org/html/rfc5849#section-3.4.1.3.1
//
function paramSources(uri, body, protocolParams) {
    var queryObj = url.parse(uri, true).query;
    var bodyObj = qs.parse(body);
    return Array.prototype.concat.apply([], [
        queryObj, bodyObj, protocolParams
    ].map(toArray));
}

//
// comparing function for Array.sort()
//
function compare(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
}

//
// Parameters Normalization
// http://tools.ietf.org/html/rfc5849#section-3.4.1.3.2
//
function normalizedRequestParameters(uri, body, protocolParams) {
    // to multidimension array
    return paramSources(uri, body, protocolParams)

    // 1.  First, the name and value of each parameter are encoded
    .map(function (p) {
        return [ encode(p[0]), encode(p[1]) ];
    })

    // 2.  The parameters are sorted by name, using ascending byte value
    //     ordering.  If two or more parameters share the same name, they
    //     are sorted by their value.
    .sort(function (a, b) {
        return compare(a[0], b[0]) || compare(a[1], b[1]);
    })

    // 3.  The name of each parameter is concatenated to its corresponding
    //     value using an "=" character (ASCII code 61) as a separator, even
    //     if the value is empty.
    .map(function (p) { return p.join('='); })

    // 4.  The sorted name/value pairs are concatenated together into a
    //     single string by using an "&" character (ASCII code 38) as
    //     separator.
    .join('&');
}

//
// HMAC-SHA1 signing key
//
function signingKey(consumerSecret, tokenSecret) {
    return encode(consumerSecret) + '&' + encode(tokenSecret);
}

//
// get signature
//
function signature(consumerSecret, tokenSecret, requestMethod, url, body, protocolParams) {
    var signatureMethod = protocolParams.oauth_signature_method;
    if (signatureMethod === 'HMAC-SHA1') {
        return crypto.createHmac('sha1', signingKey(consumerSecret, tokenSecret))
            .update(signatureBaseString(requestMethod, url, body, protocolParams))
            .digest('base64');
    }
}

//
// helper
//
function getSignature(requestMethod, url, body, oauthOpts) {
    return signature(
        oauthOpts.consumerSecret,
        oauthOpts.tokenSecret,
        requestMethod,
        url,
        body,
        protocolParameters(oauthOpts)
    );
}

module.exports = {
    _protocolParameters: protocolParameters,
    _signature: signature,
    _nonce: nonce,
    _timestamp: timestamp,
    _encode: encode,
    _decode: decodeURIComponent,
    _baseString: signatureBaseString,
    _baseStringUri: baseStringUri,
    _normalizedParameters: normalizedRequestParameters,
    signature: getSignature,
};

