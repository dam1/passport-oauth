var chai = require('chai')
  , OAuth2Strategy = require('../../lib/strategies/oauth2');


describe('OAuth2Strategy that accepts params in verify callback', function() {
    
  var strategy = new OAuth2Strategy({
      authorizationURL: 'https://www.example.com/oauth2/authorize',
      tokenURL: 'https://www.example.com/oauth2/token',
      clientID: 'ABC123',
      clientSecret: 'secret',
      callbackURL: 'https://www.example.net/auth/example/callback',
    },
    function(accessToken, refreshToken, params, profile, done) {
      if (accessToken == '2YotnFZFEjr1zCsicMWpAA'
          && refreshToken == 'tGzv3JOkF0XG5Qx2TlKWIA'
          && params.example_parameter == 'example_value'
          && Object.keys(profile).length == 0) { 
        return done(null, { id: '1234' }, { message: 'Hello' });
      }
      return done(null, false);
    });
  
  // inject a "mock" oauth2 instance
  strategy._oauth2.getOAuthAccessToken = function(code, options, callback) {
    if (code == 'SplxlOBeZQQYbYS6WxSbIA' &&
        options.grant_type == 'authorization_code' &&
        options.redirect_uri == 'https://www.example.net/auth/example/callback') {
      callback(null, '2YotnFZFEjr1zCsicMWpAA', 'tGzv3JOkF0XG5Qx2TlKWIA', { token_type: 'example', expires_in: 3600, example_parameter: 'example_value' });
    } else {
      callback(null, 'wrong-access-token', 'wrong-refresh-token');
    }
  }
  
  describe('handling an authorized return request', function() {
    var user
      , info;
  
    before(function(done) {
      chai.passport(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA';
        })
        .authenticate();
    });
  
    it('should supply user', function() {
      expect(user).to.be.an.object;
      expect(user.id).to.equal('1234');
    });
  
    it('should supply info', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('Hello');
    });
  });
  
});