/**
 * カスタムESLintルール
 * インライン型アノテーション（import { type Foo }）を禁止
 */

module.exports = {
  'no-inline-type-imports': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow inline type imports (import { type Foo }), require separate type imports',
        category: 'Best Practices',
        recommended: true
      },
      fixable: 'code',
      schema: [],
      messages: {
        noInlineType: 'Inline type imports are not allowed. Use separate import type statement instead.'
      }
    },
    create (context) {
      return {
        ImportDeclaration (node) {
          // インポート指定子をチェック
          const typeSpecifiers = []
          const valueSpecifiers = []

          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
              // インライン型アノテーション（import { type Foo }）を検出
              if (specifier.importKind === 'type') {
                typeSpecifiers.push(specifier)
              } else {
                valueSpecifiers.push(specifier)
              }
            }
          })

          // インライン型アノテーションが存在する場合はエラー
          if (typeSpecifiers.length > 0) {
            typeSpecifiers.forEach((specifier) => {
              context.report({
                node: specifier,
                messageId: 'noInlineType',
                fix (fixer) {
                  // 自動修正: 別のimport type文に分離
                  const sourceCode = context.getSourceCode()
                  const importSource = node.source.value

                  // 型インポートの名前を取得
                  const typeName = specifier.imported.name
                  const localName = specifier.local.name
                  const typeImportText = typeName === localName
                    ? typeName
                    : `${typeName} as ${localName}`

                  // 新しいimport type文を生成
                  const newImportStatement = `import type { ${typeImportText} } from '${importSource}'\n`

                  // 既存のインポートから型指定子を削除
                  if (typeSpecifiers.length === node.specifiers.length) {
                    // すべてが型インポートの場合、全体を置き換え
                    return fixer.replaceText(node, newImportStatement.trim())
                  } else {
                    // 混在している場合
                    const fixes = []

                    // 型指定子を削除
                    const specifierText = sourceCode.getText(specifier)
                    const hasComma = sourceCode.getText().includes(`${specifierText},`) ||
                                     sourceCode.getText().includes(`, ${specifierText}`)

                    if (hasComma) {
                      // カンマも含めて削除
                      const range = [
                        specifier.range[0],
                        specifier.range[1] + 1 // カンマを含める
                      ]
                      fixes.push(fixer.removeRange(range))
                    } else {
                      fixes.push(fixer.remove(specifier))
                    }

                    // 新しいimport type文を追加
                    fixes.push(fixer.insertTextBefore(node, newImportStatement))

                    return fixes
                  }
                }
              })
            })
          }
        }
      }
    }
  }
}
