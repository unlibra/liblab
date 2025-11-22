import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: '個人情報の取り扱いやデータ処理について説明します。',
  alternates: {
    canonical: '/privacy'
  },
  openGraph: {
    type: 'website',
    url: '/privacy',
    title: `プライバシーポリシー - ${siteConfig.name}`,
    description: '個人情報の取り扱いやデータ処理について説明します。',
    siteName: siteConfig.name
  },
  twitter: {
    card: 'summary',
    title: `プライバシーポリシー - ${siteConfig.name}`,
    description: '個人情報の取り扱いやデータ処理について説明します。'
  }
}

export default function PrivacyPage () {
  return (
    <div className='mx-auto max-w-3xl'>
      <Breadcrumb
        items={[
          { label: 'ホーム', href: '/' },
          { label: 'プライバシーポリシー' }
        ]}
      />

      <h1 className='mb-8 text-3xl font-bold'>プライバシーポリシー</h1>

      <div className='space-y-8'>
        <section>
          <h2 className='mb-4 text-xl font-semibold'>1. はじめに</h2>
          <p className='leading-relaxed'>
            {siteConfig.name}（以下「本サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
            本プライバシーポリシーでは、本サイトにおける情報の取り扱いについて説明します。
          </p>
        </section>

        <section>
          <h2 className='mb-4 text-xl font-semibold'>2. 収集する情報</h2>
          <div className='space-y-4 leading-relaxed'>
            <div>
              <h3 className='mb-2 font-semibold'>2.1 アクセス情報</h3>
              <p>
                本サイトではサービス改善のため、Google Analytics 4（以下「GA4」）を使用してアクセス情報を収集します。
                収集される情報には、IP アドレス（匿名化処理を含む）、ブラウザの種類、アクセス日時、閲覧ページなどが含まれます。
                Google によるデータ収集方法については Google のポリシーに従います。
              </p>
            </div>

            <div>
              <h3 className='mb-2 font-semibold'>2.2 画像データ</h3>
              <p>
                一部のツールでは画像をアップロードいただく場合があります。
                アップロードされた画像は、カラー抽出などの処理のためにサーバーに送信されますが、
                <strong className='font-semibold'>処理のみに使用され、保存されません</strong>。
              </p>
            </div>

            <div>
              <h3 className='mb-2 font-semibold'>2.3 ローカルストレージ</h3>
              <p>
                本サイトでは、テーマ設定をブラウザのローカルストレージに保存します。
                この情報はお使いのデバイスにのみ保存され、サーバーには送信されません。
              </p>
            </div>

            <div>
              <h3 className='mb-2 font-semibold'>2.4 クッキー（Cookie）</h3>
              <p>
                本サイトでは、GA4 によるアクセス解析のためにクッキーを使用します。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className='mb-4 text-xl font-semibold'>3. 情報の利用目的</h2>
          <p className='leading-relaxed'>
            収集した情報は、以下の目的で利用します：
          </p>
          <ul className='ml-6 mt-2 list-disc space-y-1 leading-relaxed'>
            <li>サービスの提供および機能の実行</li>
            <li>サービスの改善および新機能の開発</li>
            <li>アクセス状況の分析</li>
            <li>ユーザーエクスペリエンスの向上</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-4 text-xl font-semibold'>4. 情報の第三者提供</h2>
          <p className='leading-relaxed'>
            本サイトは、以下の場合を除き、収集した情報を第三者に提供することはありません：
          </p>
          <ul className='ml-6 mt-2 list-disc space-y-1 leading-relaxed'>
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>GA4などサービス提供に必要な外部サービスへの情報提供（匿名化された統計情報のみ）</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-4 text-xl font-semibold'>5. データの保存期間</h2>
          <div className='space-y-2 leading-relaxed'>
            <p>
              <strong className='font-semibold'>画像データ：</strong>保存されません。
            </p>
            <p>
              <strong className='font-semibold'>ローカルストレージ：</strong>ユーザーがブラウザから削除するまで保持されます。
            </p>
            <p>
              <strong className='font-semibold'>クッキー（GA4）：</strong>Googleのデータ保持ポリシーに従います。
            </p>
          </div>
        </section>

        <section>
          <h2 className='mb-4 text-xl font-semibold'>6. セキュリティと透明性</h2>
          <div className='space-y-4 leading-relaxed'>
            <p>
              本サイトは、情報の漏洩、紛失、改ざんなどを防ぐため、適切なセキュリティ対策を実施しています。
              すべての通信はHTTPSで暗号化されています。
            </p>
            <p>
              本サイトはオープンソースで開発されており、ソースコードは
              <a
                href={siteConfig.links.github || '#'}
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-blue-600 underline hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
              >
                GitHub
              </a>
              で公開されています。データの取り扱いに関するコードを誰でも確認できます。
            </p>
          </div>
        </section>

        <section>
          <h2 className='mb-4 text-xl font-semibold'>7. プライバシーポリシーの変更</h2>
          <p className='leading-relaxed'>
            本プライバシーポリシーは、法令の変更やサービス内容の変更に伴い、予告なく変更されることがあります。
            変更後のプライバシーポリシーは、本ページに掲載された時点で効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className='mb-4 text-xl font-semibold'>8. お問い合わせ</h2>
          <p className='leading-relaxed'>
            本プライバシーポリシーに関するご質問やご不明な点がございましたら、以下までお問い合わせください。
          </p>
          <div className='mt-4 leading-relaxed'>
            <p>
              <strong className='font-semibold'>運営者：</strong>{siteConfig.author}
            </p>
            <p className='mt-2'>
              <strong className='font-semibold'>お問い合わせ：</strong>
              <a
                href={siteConfig.links.github ? `${siteConfig.links.github}/discussions/categories/general` : '#'}
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-blue-600 underline hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
              >
                GitHubディスカッション
              </a>
            </p>
          </div>
        </section>

        <div className='mt-12 border-t border-gray-300 pt-8 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-500'>
          <p>最終更新日: {new Date().getFullYear()}年{new Date().getMonth() + 1}月{new Date().getDate()}日</p>
        </div>
      </div>
    </div>
  )
}
