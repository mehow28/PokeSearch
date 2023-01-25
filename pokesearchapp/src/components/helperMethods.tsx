const PREDICTION_URL = 'https://<XXX>.cognitiveservices.azure.com/language/:analyze-conversations?api-version=2022-10-01-preview';
const API_URL = 'https://<XXX>.azurewebsites.net/api/pokemon';
const pokeTypes = [["Normal", "Fire", "Water", "Grass", "Electric", "Ice",
"Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
"Rock", "Ghost", "Dark", "Dragon", "Steel", "Fairy"]] 

const thirdCapital = (word:string) => {
    return word.charAt(0).toLowerCase()+word.charAt(1).toLowerCase()+word.charAt(2).toUpperCase() + word.slice(3);
  }

const getPrediction = (q?: string) => {
    return {}
}

export {PREDICTION_URL, API_URL, pokeTypes, thirdCapital, getPrediction}
