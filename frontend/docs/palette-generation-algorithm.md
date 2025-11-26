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

### 3. 黄色専用処理（Cusp-aware & 非対称最適化）

**黄色は視覚的に特別**（人間の視覚システムの4つの基本色の1つ）：

```typescript
// 黄色範囲（70-115°）で特別処理（純黄色#ffff00≈110°を含む）
const YELLOW_HUE = 86°

// 非対称ガウシアン標準偏差（Lime drift防止）
const SIGMA_AMBER = 28  // Amber側：広い影響範囲（暖かさ保持）
const SIGMA_LIME = 12   // Lime側：狭い影響範囲（純黄色#ffff00の緑化防止）

sigma = hue < 86° ? SIGMA_AMBER : SIGMA_LIME
yellowInfluence = exp(-(distance²) / (2 * σ²))

// 基本強度（全カーブ共通）
let baseStrength = 0.5

// カーブ別の調整
if (curveType === 'hueShift') {
  if (hue > 86° && yellowValue > 0) {
    // Lime寄りで緑方向シフトを防ぐ
    baseStrength *= 0.1  // 90%削減

    // 高輝度シェード（50-400）でhueShiftをキャップ
    if (shade <= 400) {
      // 純黄色（H>105°）はより厳格に+2°、それ以外は+4°
      maxShift = hue > 105° ? +2° : +4°
      finalValue = min(finalValue, maxShift)  // レモン色/純黄色の緑化防止
    }

    // 知覚的最適化：純黄色のAmber warming
    // sRGB純黄色（#ffff00, H≈110°）は人工的・刺激的に見える
    // 自然界の黄色（太陽光、卵黄、蜂蜜）は暖色寄り
    // Super-Gaussian分布（指数4）で純黄色にAmber方向の補正を適用
    // 標準ガウシアン（指数2）より鋭い減衰で局所的に作用
    distToPureYellow = |hue - 110°|
    normalizedDist = distToPureYellow / 8
    influence = exp(-(normalizedDist^4))
    finalValue += -4 * influence  // 最大-4°（H=110°で）
  } else if (hue < 86° && yellowValue < 0 && shade >= 600) {
    // Amber寄りで茶色化を防ぐ
    baseStrength *= 0.4  // 60%削減
    finalValue = max(finalValue, -6°)  // オーカー崩壊防止
  }
} else if (curveType === 'chroma') {
  if (hue > 86° && yellowValue < normalValue) {
    // Lime寄りで鮮やかさを保持
    baseStrength *= 0.3  // 70%削減
  }

  // Cusp-based chroma floor（全黄色範囲）
  maxC = findMaxChroma(L, H)
  scaledChroma = max(scaledChroma, maxC * 0.80)  // 80%フロア
} else if (curveType === 'lightness') {
  if (hue > 86° && yellowChroma < limeChroma) {
    // Lime寄りで明るさを保持
    baseStrength = max(baseStrength, 0.85)  // 強化
  }

  // Cusp-aware lightness floor（黄色のcusp≈L80を考慮）
  lightnessFloor = {
    50-400: 88,  // 高輝度シェード：非常に明るく保持
    500-600: 80,  // 中輝度シェード：cusp付近を維持
    700-800: 72,  // 中暗シェード：茶色化防止
    900-950: 60   // 暗シェード：最低限の明るさ
  }
  finalValue = max(finalValue, lightnessFloor[shade])
}

finalValue = lerp(normalValue, yellowValue, yellowInfluence * baseStrength)
```

**効果**:
- **非対称ガウシアン**: Lime方向のドリフトを大幅削減（σ Amber=28, Lime=12）
- **拡張黄色範囲**: 70-115°（純黄色#ffff00≈110°を含む）
- **hueShift保護**: Lime側で+2-4°キャップ（H>105°でより厳格）、Amber側で-6°クランプ
- **純黄色Amber warming**: H≈110°に最大-4°のSuper-Gaussian補正（指数4、知覚的最適化）
- **Cusp-aware lightness**: シェードごとのL下限で茶色化/暗色化を防止
- **Cusp-based chroma**: 無効化（anchor色の過飽和を防止）

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

| 特長                       | 説明                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| **色相の個性保持**         | 微妙な色相差（シアンっぽい青 vs インディゴっぽい青）を正確に保持    |
| **滑らかな補間**           | 10アンカー間を補間、境界の不連続性なし                               |
| **非対称黄色処理**         | Lime drift防止のため非対称ガウシアン（Amber側σ=28、Lime側σ=12）    |
| **Cusp-aware lightness**   | 黄色のcusp（L≈80）を考慮した明度下限で茶色化を防止                   |
| **Cusp-based chroma**      | maxChromaの80%フロアで彩度を維持、色相補正前に適用                   |
| **両側hueShift保護**       | Lime側で+2-4°キャップ（純黄色H>105°でより厳格）、Amber側-6°クランプ |
| **純黄色Amber warming**    | H≈110°にSuper-Gaussian補正（最大-4°、指数4）で自然な暖かみ（知覚的最適化） |
| **高速**                   | 早期終了とバイナリサーチ最適化で0.032ms/パレット                     |
| **正確性**                 | OKLCh色空間で知覚的に均一な明度・彩度                                |
| **科学的正当性**           | 人間の視覚システム（反対色理論）とOKLab cusp理論に基づく処理         |

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

// 非対称ガウシアン標準偏差（影響範囲）
const SIGMA_AMBER = 28  // Amber側: より広く 30-35, より狭く 22-26
const SIGMA_LIME = 12   // Lime側: より広く 14-16, より狭く 10-12

// 基本ブレンド強度
let baseStrength = 0.5  // より強く: 0.6-0.7, より弱く: 0.3-0.4

// カーブ別調整係数
if (curveType === 'hueShift') {
  // Lime側
  baseStrength *= 0.1  // hueShift削減率: 0.05-0.2
  // 純黄色（H>105°）はより厳格なキャップ
  MAX_HUE_SHIFT = hue > 105 ? 2 : 4  // 高輝度シェードキャップ: 2-4°
  // Amber側
  baseStrength *= 0.4  // hueShift削減率: 0.3-0.5
  MIN_HUE_SHIFT = -6   // 暗シェードクランプ: -4 to -8°

  // 純黄色Amber warming（知覚的最適化）
  PURE_YELLOW_HUE = 110            // sRGB純黄色の色相
  PURE_YELLOW_SIGMA = 8            // 影響範囲: より広く 9-12, より狭く 5-7
  GAUSSIAN_EXPONENT = 4            // Super-Gaussian指数: より鋭く 6-8, より緩く 2-3
  MAX_AMBER_CORRECTION = -4        // 最大補正: より強く -5 to -6, より弱く -2 to -3
}
if (curveType === 'chroma') {
  baseStrength *= 0.3      // chroma削減率: 0.2-0.4
  CHROMA_FLOOR_PCT = 0.80  // chromaフロア係数: 0.75-0.90
}
if (curveType === 'lightness') {
  baseStrength = max(baseStrength, 0.85)  // lightness強化: 0.8-0.9
}

// Cusp-aware lightness floors（シェードごと）
const YELLOW_LIGHTNESS_FLOOR = {
  50: 88,   // 調整範囲: 85-92
  100: 88,  // 調整範囲: 85-92
  200: 88,  // 調整範囲: 85-92
  300: 88,  // 調整範囲: 85-92
  400: 88,  // 調整範囲: 85-92
  500: 80,  // 調整範囲: 75-85（cusp付近）
  600: 80,  // 調整範囲: 75-85
  700: 72,  // 調整範囲: 68-76
  800: 72,  // 調整範囲: 68-76
  900: 60,  // 調整範囲: 55-65
  950: 60   // 調整範囲: 55-65
}

// 適用範囲
const YELLOW_RANGE_START = 70   // Amber寄り
const YELLOW_RANGE_END = 115    // Lime寄り（純黄色#ffff00≈110°を含む）
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
