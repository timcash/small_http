> notes from [mdn](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
# Set Cookie
```
Set-Cookie: id=a3fWa; Expires=Thu, 31 Oct 2021 07:28:00 GMT;
```
# Security
If your site authenticates users, it should regenerate and resend session cookies, even ones that already exist, whenever a user authenticates. This approach helps prevent session fixation attacks, where a third party can reuse a user's session.

# Restrict access to cookies
You can ensure that cookies are sent securely and aren't accessed by unintended parties or scripts in one of two ways: with the `Secure` attribute and the `HttpOnly` attribute.
```
Set-Cookie: id=a3fWa; Expires=Thu, 21 Oct 2021 07:28:00 GMT; Secure; HttpOnly
```

Define where cookies are sent
The Domain and Path attributes define the scope of a cookie: what URLs the cookies should be sent to.

Domain attribute
The Domain attribute specifies which hosts can receive a cookie. If unspecified, the attribute defaults to the same host that set the cookie, excluding subdomains. If Domain is specified, then subdomains are always included. Therefore, specifying Domain is less restrictive than omitting it. However, it can be helpful when subdomains need to share information about a user.

For example, if you set Domain=mozilla.org, cookies are available on subdomains like developer.mozilla.org.

# Ways to mitigate attacks involving cookies:

Use the `HttpOnly` attribute to prevent access to cookie values via JavaScript.
Cookies that are used for sensitive information (such as indicating authentication) should have a `short lifetime`, with the `SameSite` attribute set to `Strict` or `Lax`. (See SameSite attribute, above.) In browsers that support SameSite, this ensures that the authentication cookie isn't sent with cross-site requests. This would make the request effectively unauthenticated to the application server.