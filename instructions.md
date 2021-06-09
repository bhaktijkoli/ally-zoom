The package has been configured successfully!

Make sure to first define the mapping inside the `contracts/ally.ts` file as follows.

```ts
import { ZoomDriver, ZoomDriverConfig } from 'ally-zoom/build/standalone'

declare module '@ioc:Adonis/Addons/Ally' {
  interface SocialProviders {
    // ... other mappings
    zoom: {
      config: ZoomDriverConfig
      implementation: ZoomDriver
    }
  }
}
```
