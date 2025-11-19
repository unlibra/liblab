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

### 2. アンカーマッチング

**全10アンカー**の全シェードとマッチング（L±5, H±5）：

```typescript
// 入力: blue-500 (L=62.3, H=259.8°)
// → blue anchor のshade 500 (L=62.3, H=259.8°) と完全一致
// → matchedAnchor = 'blue'
```

**マッチした場合**: そのアンカーの曲線を直接使用（均一性保証）
**マッチしない場合**: 隣接2アンカーを補間

### 3. 隣接アンカーの補間（マッチなしの場合）

入力色相から最も近い2つのアンカーを検出し、距離で重み付け：

```typescript
// 例：H=180° (青緑)
// green (149.6°) ← 30.4° → H=180° ← 35.2° → cyan (215.2°)

blendRatio = 30.4 / (30.4 + 35.2) = 0.46

// 各シェードの値を補間
L[shade] = lerp(green.L[shade], cyan.L[shade], 0.46)
C[shade] = lerp(green.C[shade], cyan.C[shade], 0.46)
H[shade] = lerpAngle(green.H[shade], cyan.H[shade], 0.46)
```

### 4. パレット生成

```typescript
for (shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
  // 目標値を取得（マッチした場合は直接、そうでなければ補間）
  targetL = anchor.lightness[shade]  // または補間値
  targetC = anchor.chroma[shade]
  hShift = anchor.hueShift[shade]

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

### 1. 全アンカーマッチング

色相シフトが大きい色（orange, amber）も正確に検出：

```typescript
// orange-200 (H=70.7°) は隣接的には amber-yellow の間だが、
// 全アンカーをチェックすることで orange anchor と正しくマッチ
```

### 2. 早期終了（ガマット内チェック）

```typescript
if (isInGamut(L, targetC, H)) {
  // バイナリサーチをスキップ（50-70%のケースで有効）
  return targetC
}
// ガマット外の場合のみバイナリサーチ実行
```

### 3. バイナリサーチ精度の最適化

```
precision: 0.1 → 0.5
反復回数: ~10回 → ~6回（40%削減）
```

**結果**: 生成速度 ~0.032ms/パレット（31,000パレット/秒）

---

## 具体例

### 例1: Tailwind blue-500 (#3B82F6)

```
入力: L=62.3, C=24.4, H=259.8°
  ↓
アンカーマッチング: blue anchor のshade 500と完全一致
  ↓
結果: Tailwind blue パレットを再現（全シェードで均一）
  blue-200 → blue-500 → blue-900 すべて同じパレット ✓
```

### 例2: カスタムカラー H=180° (青緑)

```
入力: H=180°
  ↓
隣接アンカー: green (149.6°) と cyan (215.2°)
ブレンド比率: 0.46
  ↓
結果: green と cyan の中間的なパレット
```

### 例3: Orange系の色（色相シフトが大きい）

```
orange-200: L=90.1, H=70.7° (amber寄り)
  ↓
全アンカーチェック: orange anchor のshade 200と一致
  ↓
結果: orange パレットを正しく生成 ✓
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

| 特長             | 説明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **均一性**       | 同じアンカーカラーの任意のシェードから生成しても同一パレット |
| **滑らかな補間** | 10アンカー間を補間、境界の不連続性なし                       |
| **色相保持**     | 入力色の色相を尊重、自然な色遷移                             |
| **高速**         | 早期終了とバイナリサーチ最適化で0.032ms/パレット             |
| **正確性**       | OKLCh色空間で知覚的に均一な明度・彩度                        |

---

## メンテナンス

### アンカーデータの更新

```bash
# Tailwindカラーから10アンカーのデータを抽出
npx tsx scripts/extract-anchor-colors.ts > output.txt

# palette-generator.ts の ANCHOR_CURVES を更新

# テストで検証
npx tsx scripts/test-10-anchors.ts
# → 9-10/10 PASS を確認
```

### テスト

```bash
# 均一性テスト（推奨）
npx tsx scripts/test-10-anchors.ts

# 期待される結果：
# ✓ PASS: 9/10 (greenは1/255の丸め誤差、許容範囲)
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
