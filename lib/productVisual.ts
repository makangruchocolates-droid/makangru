const PRODUCT_GRADIENTS = [
  'radial-gradient(circle at 35% 28%, #FF8C42, #D94F2B 40%, #8B2500 70%, #4A1200)',
  'radial-gradient(circle at 35% 28%, #E8B0FF, #9B59B6 38%, #6A1C8A 65%, #2C0040)',
  'radial-gradient(circle at 35% 28%, #B0E0FF, #4A90D9 35%, #1B4F8A 65%, #0A2463)',
  'radial-gradient(circle at 35% 28%, #E8C87B, #C8A030 38%, #8B6914 65%, #3D2A00)',
] as const

export function firstImage(images: unknown): string | null {
  if (Array.isArray(images)) {
    const image = images.find((value): value is string => typeof value === 'string' && value.length > 0)
    return image ?? null
  }

  if (typeof images !== 'string' || images.length === 0) return null

  try {
    return firstImage(JSON.parse(images))
  } catch {
    return images
  }
}

export function fallbackGradient(id: unknown): string {
  const value = String(id ?? 'makangru')
  const hash = [...value].reduce((total, character) => total + character.charCodeAt(0), 0)
  return PRODUCT_GRADIENTS[hash % PRODUCT_GRADIENTS.length]
}
