// Set up global test environment
// Add Response and Request to jsdom environment if not available
if (typeof global.Response === "undefined") {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = (init && init.status) || 200;
    }
  };
}

if (typeof global.Request === "undefined") {
  global.Request = class Request {
    constructor(url, init) {
      this.url = url;
      this.method = (init && init.method) || 'GET';
    }
  };
}
