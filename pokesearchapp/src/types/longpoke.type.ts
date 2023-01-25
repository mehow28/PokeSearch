export interface ILongPokemon {
    id: number,
    englishName: string,
    hp: number,
    attack: number,
    defense: number,
    spAttack: number,
    spDefense: number,
    speed: number,
    type1: string,
    type2?: string | null
}
