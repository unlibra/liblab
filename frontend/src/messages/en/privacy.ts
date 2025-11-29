import type { privacy as jaPrivacy } from '../ja/privacy'
import type { SameStructure } from '../type-utils'

export const privacy: SameStructure<typeof jaPrivacy> = {
  title: 'Privacy Policy',
  description: 'Learn about our handling of personal information and data processing.',
  lastUpdated: 'Last Updated: November 27, 2025',
  sections: [
    {
      id: 'introduction',
      title: '1. Introduction',
      body: `
        8px.app ("this Site") respects user privacy and is committed to protecting personal information.
        This Privacy Policy explains how information is handled on this Site.
      `,
      children: null
    },
    {
      id: 'collection',
      title: '2. Information We Collect',
      body: null,
      children: [
        {
          id: 'access-info',
          subtitle: '2.1 Access Information',
          body: `
            This Site uses third-party analytics services to improve user experience.
            These services collect only anonymized access data and do not use cookies.
            Collected information includes page views, time spent, and referrers, but does not include personally identifiable information.
          `,
          children: null
        },
        {
          id: 'image-data',
          subtitle: '2.2 Image Data',
          body: `
            Some tools may require you to upload images.
            Uploaded images are sent to the server for processing such as color extraction, but are used only for processing and are not stored.
          `,
          children: null
        },
        {
          id: 'local-storage',
          subtitle: '2.3 Local Storage',
          body: `
            This Site stores color palettes and theme settings in your browser's local storage.
            This information is stored only on your device and is not sent to servers.
          `,
          children: null
        },
        {
          id: 'cookies',
          subtitle: '2.4 Cookies',
          body: `
            This Site does not use cookies.
          `,
          children: null
        },
      ]
    },
    {
      id: 'purpose-of-use',
      title: '3. Purpose of Use',
      body: `
        Collected information is used for the following purposes:

        - Providing services and executing functions
        - Improving services and developing new features
        - Analyzing access patterns
        - Enhancing user experience
      `,
      children: null
    },
    {
      id: 'third-party-disclosure',
      title: '4. Third-Party Disclosure',
      body: `
        This Site does not provide collected information to third parties except in the following cases:

        - With user consent
        - When required by law
        - Providing information to external services necessary for service delivery (anonymized statistical information only)
      `,
      children: null
    },
    {
      id: 'data-retention-period',
      title: '5. Data Retention Period',
      body: `
        Image data: Not stored.
        Local storage: Retained until deleted by user from browser.
        Analytics data: Follows each service's data retention policy.
      `,
      children: null
    },
    {
      id: 'security-and-transparency',
      title: '6. Security and Transparency',
      body: `
        This Site implements appropriate security measures to prevent information leakage, loss, or alteration.
        All communications are encrypted via HTTPS.

        This Site is developed as open source, and the source code is publicly available on GitHub. Anyone can review the code related to data handling.
      `,
      children: null
    },
    {
      id: 'privacy-policy-changes',
      title: '7. Privacy Policy Changes',
      body: `
        This Privacy Policy may be changed without notice due to legal changes or service updates.
        The revised Privacy Policy becomes effective when posted on this page.
      `,
      children: null
    },
    {
      id: 'contact',
      title: '8. Contact',
      body: `
        If you have any questions or concerns about this Privacy Policy, please contact us:

        Operator: unlibra
        Contact: https://github.com/unlibra/8px.app/discussions
      `,
      children: null
    }
  ]
} as const
