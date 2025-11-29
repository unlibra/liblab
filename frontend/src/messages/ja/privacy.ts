export const privacy = {
  title: 'プライバシーポリシー',
  description: '個人情報の取り扱いやデータ処理について説明します。',
  lastUpdated: '最終更新日: 2025年11月27日',
  sections: [
    {
      id: 'introduction',
      title: '1. はじめに',
      body: `
        8px.app（以下「本サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
        本プライバシーポリシーでは、本サイトにおける情報の取り扱いについて説明します。
      `,
      children: null
    },
    {
      id: 'collection',
      title: '2. 収集する情報',
      body: null,
      children: [
        {
          id: 'access-info',
          subtitle: '2.1 アクセス情報',
          body: `
            本サイトではユーザー体験の改善のため、第三者のアクセス解析サービスを利用しています。
            本サービスは匿名化されたアクセスデータのみを収集しており、Cookieは使用していません。
            収集される情報にはページの閲覧回数- 滞在時間- リファラー等が含まれますが、個人を特定できる情報は含まれていません。
          `,
          children: null
        },
        {
          id: 'image-data',
          subtitle: '2.2 画像データ',
          body: `
            一部のツールでは画像をアップロードいただく場合があります。
            アップロードされた画像は、カラー抽出などの処理のためにサーバーに送信されますが、処理のみに使用され、保存されません。
          `,
          children: null
        },
        {
          id: 'local-storage',
          subtitle: '2.3 ローカルストレージ',
          body: `
            本サイトでは、カラーパレットやテーマ設定をブラウザのローカルストレージに保存します。
            この情報はお使いのデバイスにのみ保存され、サーバーには送信されません。
          `,
          children: null
        },
        {
          id: 'cookies',
          subtitle: '2.4 クッキー（Cookie）',
          body: `
            当サイトではCookieを使用していません。
          `,
          children: null
        },
      ]
    },
    {
      id: 'purpose-of-use',
      title: '3. 情報の利用目的',
      body: `
        収集した情報は、以下の目的で利用します:

        - サービスの提供および機能の実行
        - サービスの改善および新機能の開発
        - アクセス状況の分析
        - ユーザーエクスペリエンスの向上
      `,
      children: null
    },
    {
      id: 'third-party-disclosure',
      title: '4. 情報の第三者提供',
      body: `
        本サイトは、以下の場合を除き、収集した情報を第三者に提供することはありません:

        - ユーザーの同意がある場合
        - 法令に基づく場合
        - サービス提供に必要な外部サービスへの情報提供（匿名化された統計情報のみ）
      `,
      children: null
    },
    {
      id: 'data-retention-period',
      title: '5. データの保存期間',
      body: `
        画像データ: 保存されません。
        ローカルストレージ: ユーザーがブラウザから削除するまで保持されます。
        アクセス解析データ: 各サービスのデータ保持ポリシーに従います。
      `,
      children: null
    },
    {
      id: 'security-and-transparency',
      title: '6. セキュリティと透明性',
      body: `
        本サイトは、情報の漏洩、紛失、改ざんなどを防ぐため、適切なセキュリティ対策を実施しています。
        すべての通信はHTTPSで暗号化されています。
        本サイトはオープンソースで開発されており、ソースコードはGitHubで公開されています。データの取り扱いに関するコードを誰でも確認できます。
      `,
      children: null
    },
    {
      id: 'privacy-policy-changes',
      title: '7. プライバシーポリシーの変更',
      body: `
        本プライバシーポリシーは、法令の変更やサービス内容の変更に伴い、予告なく変更されることがあります。
        変更後のプライバシーポリシーは、本ページに掲載された時点で効力を生じるものとします。
      `,
      children: null
    },
    {
      id: 'contact',
      title: '8. お問い合わせ',
      body: `
        本プライバシーポリシーに関するご質問やご不明な点がございましたら、以下までお問い合わせください。

        運営者: unlibra
        お問い合わせ: https://github.com/unlibra/8px.app/discussions
      `,
      children: null
    }
  ]
} as const
