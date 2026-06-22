export const cardVariants = ['normal', 'holo', 'reverse'] as const
export type CardVariant = (typeof cardVariants)[number]

export const cardConditions = [
  'nm',
  'nm-',
  'lp+',
  'lp',
  'lp-',
  'mp+',
  'mp',
  'mp-',
  'hp+',
  'hp',
  'hp-',
  'dmg',
] as const
export type CardCondition = (typeof cardConditions)[number]

export const cardStatuses = ['available', 'pending', 'sold'] as const
export type CardStatus = (typeof cardStatuses)[number]

export interface PokemonCard {
  id: string
  name: string
  set?: string
  number: string
  variant: CardVariant
  frontImage: string
  backImage: string
  condition: CardCondition
  language: string
  price?: number
  pricePaid?: number
  notes?: string
  status: CardStatus
}
