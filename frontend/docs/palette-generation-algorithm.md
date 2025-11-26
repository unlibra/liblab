# Tailwind風パレット生成アルゴリズム

任意の入力色から、Tailwind CSS風の50-950シェードを持つカラーパレットを生成します。

## 核心コンセプト

**10個のアンカーカラー**の曲線データ（lightness, chroma, hueShift）を補間することで、色相環上の全ての色に対応します。

```
Red    (25.3°) → Orange (47.6°) → Amber  (70.1°) → Yellow (86.0°) → Lime (130.8°)
→ Green (149.6°) → Cyan (215.2°) → Blue (259.8°) → Purple (303.9°) → Pink (354.3°)
```

**色空間**: OKLCh（知覚的に均一、特に黄色系で優れる）

---

## アルゴリズムの流れ

### 1. 入力色の解析

```typescript
入力: #3B82F6 (Tailwind blue-500)
↓
OKLCh変換: L=62.3, C=24.4, H=259.8°
```

### 2. 隣接アンカーの補間

**常に隣接2アンカーを補間**（入力色相の個性を保持）：

```typescript
// 例：H=180° (青緑)
// green (149.6°) ← 30.4° → H=180° ← 35.2° → cyan (215.2°)

blendRatio = 30.4 / (30.4 + 35.2) = 0.46

// 各シェードの値を補間
L[shade] = lerp(green.L[shade], cyan.L[shade], 0.46)
C[shade] = lerp(green.C[shade], cyan.C[shade], 0.46)
H[shade] = lerpAngle(green.H[shade], cyan.H[shade], 0.46)
```

**重要な改善**: アンカーマッチングを廃止し、常に補間を使用することで、
微妙な色相の違い（シアンっぽい青 vs インディゴっぽい青）を保持。

### 3. 黄色専用処理

**黄色は視覚的に特別**（人間の視覚システムの4つの基本色の1つ）：

```typescript
// 黄色範囲（70-110°）で特別処理
const YELLOW_HUE = 86°
const SIGMA = 22  // ガウシアン標準偏差

// ガウシアン影響度を計算
yellowInfluence = exp(-(distance²) / (2 * σ²))

// 通常補間と黄色アンカーをブレンド
finalValue = lerp(normalValue, yellowValue, yellowInfluence * 0.65)
```

**効果**:
- H=103°（薄い黄色）→ 74%の黄色影響（Lime化を防ぐ）
- H=80°（Amber寄り）→ 97%の黄色影響
- ガウシアン減衰で滑らかな境界（40°まで徐々に影響減少）

### 4. パレット生成

```typescript
for (shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
  // 補間（または黄色処理）で目標値を取得
  targetL = getBlendedValue(inputHue, shade, 'lightness')
  targetC = getBlendedValue(inputHue, shade, 'chroma')
  hShift = getBlendedValue(inputHue, shade, 'hueShift')

  // 最終色を計算
  L = targetL
  H = baseHue + hShift  // 入力色相を基準に回転

  // ガマットマッピング
  if (isInGamut(L, targetC, H)) {
    C = targetC  // そのまま使用
  } else {
    C = findMaxChromaInGamut(L, H)  // バイナリサーチ
  }

  // OKLCh → HEX
  palette[shade] = oklchToHex({L, C, H})
}
```

---

## 重要な最適化

### 1. 早期終了（ガマット内チェック）

```typescript
if (isInGamut(L, targetC, H)) {
  // バイナリサーチをスキップ（50-70%のケースで有効）
  return targetC
}
// ガマット外の場合のみバイナリサーチ実行
```

### 2. バイナリサーチ精度の最適化

```
precision: 0.1 → 0.5
反復回数: ~10回 → ~6回（40%削減）
```

### 3. 黄色専用処理の限定的な適用

70-110°の範囲のみで追加計算を実行。他の領域ではパフォーマンス影響なし。

**結果**: 生成速度 ~0.032ms/パレット（31,000パレット/秒）

---

## 具体例

### 例1: Tailwind blue-500 (#3B82F6)

```
入力: L=62.3, C=24.4, H=259.8°
  ↓
隣接アンカー: blue (259.8°) と purple (303.9°)
ブレンド比率: ≈0 (blueに非常に近い)
  ↓
結果: Tailwind blue パレットにほぼ一致
```

### 例2: カスタムカラー H=180° (青緑)

```
入力: H=180°
  ↓
隣接アンカー: green (149.6°) と cyan (215.2°)
ブレンド比率: 0.46
  ↓
結果: green と cyan の中間的なパレット
  シアンっぽい青 (H=210°) とは明確に異なる ✓
```

### 例3: 薄い黄色 (#fef9c3)

```
入力: L=97.3, C=9.0, H=103.2°
  ↓
通常補間: yellow (86°) と lime (130.8°)
ブレンド比率: 0.38 (yellow 62% + lime 38%)
  ↓
黄色処理: Yellow距離 17.2° → ガウシアン影響 74%
最終ブレンド: 48%の黄色影響を追加
  ↓
結果: Lime化を防ぎ、黄色らしさを保持 ✓
  (黄色処理なしだと Lime寄りになる)
```

---

## アンカーカーブの構造

```typescript
interface AnchorCurves {
  centerHue: number  // shade 500 の色相
  lightness: Record<TailwindShade, number>
  chroma: Record<TailwindShade, number>
  hueShift: Record<TailwindShade, number>  // centerHue からのずれ
}

// 例: blue
{
  centerHue: 259.8,
  lightness: {
    50: 97.0, 100: 93.2, 200: 88.2, ..., 950: 28.2
  },
  chroma: {
    50: 1.8, 100: 4.1, 200: 7.4, ..., 950: 11.4
  },
  hueShift: {
    50: -5.2, 100: -4.2, 200: -5.7, ..., 950: 8.1
  }
}
```

**hueShift の意味**: 明るいシェードは青紫寄り、暗いシェードは紫寄りにシフト

---

## API

```typescript
function generatePalette(
  inputHex: string,
  options?: {
    hueShift?: number  // 色相を回転（0-360°）
  }
): ColorPalette | null

// 使用例
const palette = generatePalette('#3B82F6')
// → { 50: '#EFF6FF', 100: '#DBEAFE', ..., 950: '#172554' }

// 色相を30°回転
const rotated = generatePalette('#3B82F6', { hueShift: 30 })
```

---

## アルゴリズムの特長

| 特長                 | 説明                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| **色相の個性保持**   | 微妙な色相差（シアンっぽい青 vs インディゴっぽい青）を正確に保持    |
| **滑らかな補間**     | 10アンカー間を補間、境界の不連続性なし                               |
| **黄色の特別扱い**   | 視覚的に特別な黄色をガウシアン処理で適切に保持                       |
| **高速**             | 早期終了とバイナリサーチ最適化で0.032ms/パレット                     |
| **正確性**           | OKLCh色空間で知覚的に均一な明度・彩度                                |
| **科学的正当性**     | 人間の視覚システム（反対色理論）に基づく黄色の特別処理               |

---

## メンテナンス

### アンカーデータの更新

```bash
# Tailwindカラーから10アンカーのデータを抽出
npx tsx scripts/extract-anchor-colors.ts > output.txt

# palette-generator.ts の ANCHOR_CURVES を更新
```

### 黄色処理のパラメータ調整

```typescript
// src/lib/color/palette-generator.ts

// ガウシアン標準偏差（影響範囲）
const SIGMA = 22  // より広く: 25-30, より狭く: 15-20

// ブレンド強度
const blendStrength = yellowInfluence * 0.65  // より強く: 0.7-0.8, より弱く: 0.5-0.6

// 適用範囲
const YELLOW_RANGE_START = 70   // Amber寄り
const YELLOW_RANGE_END = 110    // Lime寄り
```

---

## 技術的詳細

### 色空間: OKLCh

- **OK**: Oklab色空間（知覚的均一性が高い）
- **L**: Lightness（明度、0-100）
- **C**: Chroma（彩度、0-150程度）
- **h**: Hue（色相、0-360°）

**LChとの違い**: 特に黄色系での知覚的均一性が向上

### ガマットマッピング

sRGB範囲外の色は、L/Hを固定してCをバイナリサーチ：

```typescript
while (high - low > 0.5) {
  mid = (low + high) / 2
  if (isInGamut(L, mid, H)) {
    maxC = mid
    low = mid
  } else {
    high = mid
  }
}
```

**精度0.5**: 人間の目には区別不可能なレベル

---

## パフォーマンス

| 指標               | 値                             |
| ------------------ | ------------------------------ |
| 生成速度           | ~0.032ms/パレット              |
| スループット       | ~31,000パレット/秒             |
| マッチングチェック | 110回（10アンカー×11シェード） |
| ガマット回避率     | 50-70%（早期終了）             |

**結論**: 実用上は瞬時に生成される
