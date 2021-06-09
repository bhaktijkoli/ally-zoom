/*
|--------------------------------------------------------------------------
| Ally Oauth driver
|--------------------------------------------------------------------------
|
| This is a dummy implementation of the Oauth driver. Make sure you
|
| - Got through every line of code
| - Read every comment
|
*/

import type { AllyUserContract } from '@ioc:Adonis/Addons/Ally'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Oauth2Driver, ApiRequest, RedirectRequest } from '@adonisjs/ally/build/standalone'

/**
 * Define the access token object properties in this type. It
 * must have "token" and "type" and you are free to add
 * more properties.
 *
 * ------------------------------------------------
 * Change "ZoomDriver" to something more relevant
 * ------------------------------------------------
 */
export type ZoomDriverAccessToken = {
  token: string
  type: 'bearer'
}

/**
 * Define a union of scopes your driver accepts. Here's an example of same
 * https://github.com/adonisjs/ally/blob/develop/adonis-typings/ally.ts#L236-L268
 *
 * ------------------------------------------------
 * Change "ZoomDriver" to something more relevant
 * ------------------------------------------------
 */
export type ZoomDriverScopes = string

/**
 * Define the configuration options accepted by your driver. It must have the following
 * properties and you are free add more.
 *
 * ------------------------------------------------
 * Change "ZoomDriver" to something more relevant
 * ------------------------------------------------
 */
export type ZoomDriverConfig = {
  driver: 'zoom'
  clientId: string
  clientSecret: string
  callbackUrl: string
  authorizeUrl?: string
  accessTokenUrl?: string
  userInfoUrl?: string
}

/**
 * Driver implementation. It is mostly configuration driven except the user calls
 *
 * ------------------------------------------------
 * Change "ZoomDriver" to something more relevant
 * ------------------------------------------------
 */
export class ZoomDriver extends Oauth2Driver<ZoomDriverAccessToken, ZoomDriverScopes> {
  /**
   * The URL for the redirect request. The user will be redirected on this page
   * to authorize the request.
   *
   * Do not define query strings in this URL.
   */
  protected authorizeUrl = 'https://zoom.us/oauth/authorize'

  /**
   * The URL to hit to exchange the authorization code for the access token
   *
   * Do not define query strings in this URL.
   */
  protected accessTokenUrl = 'https://zoom.us/oauth/token'

  /**
   * The URL to hit to get the user details
   *
   * Do not define query strings in this URL.
   */
  protected userInfoUrl = 'https://api.zoom.us/v2/users/me'

  /**
   * The param name for the authorization code. Read the documentation of your oauth
   * provider and update the param name to match the query string field name in
   * which the oauth provider sends the authorization_code post redirect.
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error. Read the documentation of your oauth provider and update
   * the param name to match the query string field name in which the oauth provider sends
   * the error post redirect
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the CSRF token. Make sure it is always unique. So a better
   * approach is to prefix the oauth provider name to `oauth_state` value. For example:
   * For example: "facebook_oauth_state"
   */
  protected stateCookieName = 'zoom_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state from.
   * Read the documentation of your oauth provider and update the param
   * name to match the query string used by the provider for exchanging
   * the state.
   */
  protected stateParamName = 'state'

  /**
   * Parameter name for sending the scopes to the oauth provider.
   */
  protected scopeParamName = 'scope'

  /**
   * The separator indentifier for defining multiple scopes
   */
  protected scopesSeparator = ' '

  constructor(ctx: HttpContextContract, public config: ZoomDriverConfig) {
    super(ctx, config)

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request.
     *
     * DO NOT REMOVE THE FOLLOWING LINE
     */
    this.loadState()
  }

  protected configureRedirectRequest(request: RedirectRequest<ZoomDriverScopes>) {
    request.param('response_type', 'code')
  }

  /**
   * Optionally configure the authorization redirect request. The actual request
   * is made by the base implementation of "Oauth2" driver and this is a
   * hook to pre-configure the request.
   */
  // protected configureRedirectRequest(request: RedirectRequest<ZoomDriverScopes>) {}

  /**
   * Optionally configure the access token request. The actual request is made by
   * the base implementation of "Oauth2" driver and this is a hook to pre-configure
   * the request
   */
  // protected configureAccessTokenRequest(request: ApiRequest) {}

  /**
   * Update the implementation to tell if the error received during redirect
   * means "ACCESS DENIED".
   */
  public accessDenied() {
    return this.ctx.request.input('error') === 'user_denied'
  }

  /**
   * Get the user details by query the provider API. This method must return
   * the access token and the user details both. Checkout the google
   * implementation for same.
   *
   * https://github.com/adonisjs/ally/blob/develop/src/Drivers/Google/index.ts#L191-L199
   */
  public async user(
    callback?: (request: ApiRequest) => void
  ): Promise<AllyUserContract<ZoomDriverAccessToken>> {
    const accessToken = await this.accessToken()
    const request = this.httpClient(this.config.userInfoUrl || this.userInfoUrl)
    request.header('Authorization', `Bearer ${accessToken.token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if required)
     */
    if (typeof callback === 'function') {
      callback(request)
    }

    /**
     * Write your implementation details here
     */

    const body = await request.get()
    return {
      id: body.id,
      avatarUrl: body.pic_url,
      name: body.first_name + ' ' + body.last_name,
      nickName: body.first_name + ' ' + body.last_name,
      email: body.email,
      emailVerificationState: body.verified === 0 ? 'unverified' : 'verified',
      token: accessToken,
      original: body,
    }
  }

  public async userFromToken(
    accessToken: string,
    callback?: (request: ApiRequest) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>> {
    const request = this.httpClient(this.config.userInfoUrl || this.userInfoUrl)
    request.header('Authorization', `Bearer ${accessToken}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if required)
     */
    if (typeof callback === 'function') {
      callback(request)
    }

    /**
     * Write your implementation details here
     */
    const body = await request.get()
    return {
      id: body.id,
      avatarUrl: body.pic_url,
      name: body.first_name + ' ' + body.last_name,
      nickName: body.first_name + ' ' + body.last_name,
      email: body.email,
      emailVerificationState: body.verified === 0 ? 'unverified' : 'verified',
      original: body,
      token: { token: accessToken, type: 'bearer' as const },
    }
  }
}
