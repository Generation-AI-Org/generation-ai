/**
 * KB Tools Test Script
 *
 * Verifies all KB tools work against real Supabase data.
 * Run with: npm run test:kb-tools
 */

import { kbExplore, kbList, kbRead, kbSearch, executeTool, KB_TOOLS } from '../lib/kb-tools'

async function main() {
  console.log('--- Testing KB Tools ---\n')

  // Test 1: kb_explore
  console.log('1. kbExplore()')
  const explore = await kbExplore()
  console.log('   Categories:', Object.keys(explore.categories).length)
  console.log('   Types:', Object.keys(explore.types).length)
  console.log('   Total:', explore.total)
  if (explore.total === 0) {
    throw new Error('kbExplore returned no items - is the database empty?')
  }
  console.log('   [OK] Found', explore.total, 'published items')

  // Test 2: kb_list with type filter
  console.log('\n2. kbList({ type: "tool", limit: 3 })')
  const list = await kbList({ type: 'tool', limit: 3 })
  console.log('   Found:', list.length, 'items')
  list.forEach(item => console.log('   -', item.title, `(${item.slug})`))
  console.log('   [OK] kbList returns items')

  // Test 3: kb_read (use first item from list if available)
  if (list.length > 0) {
    const testSlug = list[0].slug
    console.log('\n3. kbRead("' + testSlug + '")')
    const item = await kbRead(testSlug)
    if (!item) {
      throw new Error(`kbRead returned null for slug "${testSlug}"`)
    }
    console.log('   Title:', item.title)
    console.log('   Type:', item.type)
    console.log('   Category:', item.category)
    console.log('   Content length:', item.content.length, 'chars')
    console.log('   [OK] kbRead returns full content')
  } else {
    console.log('\n3. kbRead() - SKIPPED (no tools found to test)')
  }

  // Test 4: kb_search
  console.log('\n4. kbSearch("KI", 3)')
  const search = await kbSearch('KI', 3)
  console.log('   Found:', search.length, 'items')
  search.forEach(item => console.log('   -', item.title))
  console.log('   [OK] kbSearch returns results')

  // Test 5: executeTool dispatcher
  console.log('\n5. executeTool("kb_explore", {})')
  const dispatchResult = await executeTool('kb_explore', {})
  const parsed = JSON.parse(dispatchResult)
  if (typeof parsed.total !== 'number') {
    throw new Error('executeTool did not return valid JSON')
  }
  console.log('   Parsed total:', parsed.total)
  console.log('   [OK] executeTool dispatcher works')

  // Test 6: KB_TOOLS array format
  console.log('\n6. KB_TOOLS array')
  console.log('   Tools defined:', KB_TOOLS.length)
  KB_TOOLS.forEach(tool => {
    console.log('   -', tool.name)
    if (!tool.name || !tool.description || !tool.input_schema) {
      throw new Error(`Tool ${tool.name} missing required fields`)
    }
  })
  console.log('   [OK] All tools have required fields (name, description, input_schema)')

  // Test 7: Unknown tool handling
  console.log('\n7. executeTool("unknown_tool", {})')
  const unknownResult = await executeTool('unknown_tool', {})
  const unknownParsed = JSON.parse(unknownResult)
  if (unknownParsed.error !== 'Unknown tool') {
    throw new Error('executeTool did not return error for unknown tool')
  }
  console.log('   Result:', unknownParsed)
  console.log('   [OK] Unknown tools return error')

  console.log('\n--- All tests passed ---')
}

main().catch(err => {
  console.error('\n--- TEST FAILED ---')
  console.error(err)
  process.exit(1)
})
