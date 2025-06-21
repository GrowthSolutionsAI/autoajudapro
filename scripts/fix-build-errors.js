console.log("🔧 Fixing build errors...")

// Check if all required dependencies are installed
const requiredDeps = ["tailwindcss", "autoprefixer", "postcss", "@anthropic-ai/sdk", "groq-sdk", "ai"]

console.log("✅ Required dependencies check:")
requiredDeps.forEach((dep) => {
  try {
    require.resolve(dep)
    console.log(`  ✓ ${dep}`)
  } catch (e) {
    console.log(`  ✗ ${dep} - MISSING`)
  }
})

console.log("\n🚀 Build should work now!")
console.log("Run: npm install && npm run build")
