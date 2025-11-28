/* eslint-disable @typescript-eslint/consistent-type-imports */
import messages from '../../messages/ja.json'

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
  }
}
