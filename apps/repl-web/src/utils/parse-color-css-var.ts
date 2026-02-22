function parseColorCssVars(...varNames: string[]) {
  const styles = window.getComputedStyle(document.documentElement)

  return varNames.map((varName) => {
    const rawFgLCH = styles.getPropertyValue(varName)
    const fgLCH = rawFgLCH.split(' ').map(parseFloat)
    return isLCH(fgLCH) ? fgLCH : undefined
  })
}

function isLCH(arr: any[]): arr is [number, number, number] {
  if (arr.length !== 3) {
    return false
  }

  for (const item of arr) {
    if (typeof item !== 'number' || !Number.isFinite(item)) {
      return false
    }
  }

  return true
}

export { parseColorCssVars }
