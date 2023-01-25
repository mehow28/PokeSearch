const API_URL = 'https://pokesearchapidev.azurewebsites.net/api/pokemon';
 
const FetchService = {
    async getPokeList(q?:string,type1?:string,type2?:string,pageNumber?:number) {
        return await fetch(API_URL + "?q=" +q+ "&type1=psychic" +type1+ "&type2=" +type2+ "&pageNumber=" + pageNumber).then((res)=>res.json());
    },
    async getPokeLikeList(type1:string,type2?:string,pageNumber?:number) {
        return await fetch(API_URL+"/oftype&type1="+type1+"&type2="+type2+"&pageNumber="+pageNumber).then((res)=>res.json())
    },
    async getOnePoke(id:string) {
        return await fetch(API_URL+'/'+id).then((res)=>res.json())
    }
}

export default FetchService;