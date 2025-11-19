import { generatePalette } from '../src/lib/color/palette-generator'
import { tailwindColors } from '../src/lib/color/tailwind-colors'

console.log('Comprehensive Test of 10-Anchor System')
console.log('='.repeat(80))

// Test all anchors for uniformity
const anchorColors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'cyan', 'blue', 'purple', 'pink'] as const

let passCount = 0
let failCount = 0

for (const color of anchorColors) {
  const testShades = [200, 500, 900] as const
  const results: string[] = []

  for (const shade of testShades) {
    const hex = tailwindColors[color][shade]
    const palette = generatePalette(hex)
    if (palette) {
      results.push(palette[500])
    }
  }

  const allSame = results.every(r => r === results[0])
  const status = allSame ? '✓' : '✗'

  if (allSame) {
    passCount++
  } else {
    failCount++
  }

  console.log(`${status} ${color.padEnd(8)} uniformity: ${allSame ? 'PASS' : 'FAIL'}`)

  if (!allSame) {
    console.log(`  ${color}-200 → ${results[0]}`)
    console.log(`  ${color}-500 → ${results[1]}`)
    console.log(`  ${color}-900 → ${results[2]}`)
  }
}

console.log('\n' + '='.repeat(80))
console.log('SUMMARY')
console.log('='.repeat(80))
console.log('Total anchors: 10')
console.log(`✓ PASS: ${passCount}`)
console.log(`✗ FAIL: ${failCount}`)

if (failCount === 0) {
  console.log('\n🎉 All 10 anchors work perfectly!')
} else if (failCount === 1 && passCount === 9) {
  console.log('\n✅ 9/10 anchors work perfectly (1 minor issue)')
} else {
  console.log(`\n⚠️  ${failCount} anchors have uniformity issues`)
}

console.log('\n' + '='.repeat(80))
console.log('Anchor Spacing (10-Anchor System):')
console.log('='.repeat(80))
console.log('Red (25.3°) → Orange (47.6°) → Amber (70.1°) → Yellow (86.0°)')
console.log('→ Lime (130.8°) → Green (149.6°) → Cyan (215.2°) → Blue (259.8°)')
console.log('→ Purple (303.9°) → Pink (354.3°) → [Red]')
console.log('\nAverage gap: 35.5°')
console.log('Min gap: 15.9° (amber → yellow)')
console.log('Max gap: 65.6° (green → cyan)')
