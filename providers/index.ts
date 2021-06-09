import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class ZoomDriverProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const Ally = this.app.container.resolveBinding('Adonis/Addons/Ally')
    const { ZoomDriver } = await import('../src/ZoomDriver')

    Ally.extend('zoom', (_, __, config, ctx) => {
      return new ZoomDriver(ctx, config)
    })
  }
}
