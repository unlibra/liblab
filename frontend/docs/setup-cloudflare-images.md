# Cloudflare Images セットアップガイド

## 1. Cloudflare DNS設定

### 画像サブドメインの設定（オレンジクラウド）

```
Type: CNAME
Name: img
Target: cname.vercel-dns.com
Proxy: ✅ Proxied (オレンジクラウド)
TTL: Auto
```

**重要**: 画像サブドメインのみオレンジクラウドにすることで、Cloudflare Imagesの変換機能を利用できます。

## 2. Vercel カスタムドメイン設定

1. Vercelダッシュボード → プロジェクト → Settings → Domains
2. 以下のドメインを追加：
   - `yourdomain.com` （または `www.yourdomain.com`）
   - `img.yourdomain.com`
3. Vercelが自動的にSSL証明書を発行

## 3. Vercel Web Analytics設定

1. Vercelダッシュボード → プロジェクト → Analytics タブ
2. 「Enable Web Analytics」をクリック
3. 自動的にスクリプトが注入されます（コード変更不要）

## 4. 動作確認

### デプロイ後の確認

1. **画像の変換を確認**
   - ブラウザの開発者ツールを開く
   - Network タブで画像のURLを確認
   - `https://img.yourdomain.com/cdn-cgi/image/...` のようなURLになっているか確認
   - レスポンスヘッダーに `cf-polished: format=webp` などがあることを確認

2. **画像フォーマットの確認**
   - WebP対応ブラウザでは `.webp` で配信
   - AVIF対応ブラウザでは `.avif` で配信（最新ブラウザ）

3. **Vercel Analyticsの確認**
   - Vercelダッシュボード → Analytics
   - アクセスデータが表示されることを確認

## トラブルシューティング

### 画像が表示されない

1. **Cloudflare DNS設定を確認**
   - `img.yourdomain.com`がオレンジクラウド（Proxied）になっているか
   - CNAMEターゲットが`cname.vercel-dns.com`になっているか

2. **Vercelドメイン設定を確認**
   - `img.yourdomain.com`がVercelに追加されているか
   - SSL証明書が発行されているか（通常は自動）

3. **環境変数を確認**
   - `NEXT_PUBLIC_IMAGES_DOMAIN`が正しく設定されているか
   - `https://`で始まっているか（スキームを含める）

### SSL証明書エラー

- Vercel側でドメインを追加してから、Cloudflare側で設定してください
- SSL/TLSの暗号化モードを「Full」または「Full (strict)」に設定

### 画像が変換されない

- Cloudflareの`images`サブドメインがオレンジクラウドになっているか確認
- ブラウザのキャッシュをクリアして再度確認

## 参考リンク

- [Cloudflare Images Documentation](https://developers.cloudflare.com/images/)
- [Cloudflare Images Pricing](https://developers.cloudflare.com/images/pricing/)
- [Vercel Custom Domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Vercel Web Analytics](https://vercel.com/docs/analytics)
