import { ILongPokemon } from "../types/longpoke.type"
import {Table} from 'react-bootstrap'
import { appInsights } from "../appInsights"

const tableView = (userUuid:string,page:number,data?:ILongPokemon[]) => {
    if(data!==undefined){
        return (
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Type 1</th>
                    <th>Type 2</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((poke, index) => (
                    <tr key={poke.id}>
                        <td>{poke.id}</td>
                        <td><Link
                        state={{userUuid:userUuid}}  
                        onClick={() => appInsights.trackEvent({
                            name: "clickedPokemonLink", properties:
                            {
                            userUuid: userUuid, pokeId: poke.id, types: [poke.type1, poke.type2],
                            position: index+1, totalPosition: (page - 1) * 10 + index+1, pageNumber: page
                            }
                        })}
                        to={`pokemon/${poke.id}`}>
                        {poke.englishName}
                        </Link></td>
                        <td>{poke.type1}</td>
                        <td>{poke.type2}</td>
                    </tr>
                    ))}
                </tbody>
                </Table>
            )
        }
        else{
            return(<></>)
        } 
  }
  const tableViewPoke = (userUuid:string,data?:ILongPokemon[]) => {
    return (
        <Table striped bordered hover size="sm">
        <thead>
        <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Type 1</th>
            <th>Type 2</th>
        </tr>
        </thead>
        <tbody>
        {data?.map((poke,index) => (
            <tr key={poke.id}>
            <td>{poke.id}</td>
                <td><Link to={`/pokemon/${poke.id}`}
                    state={{userUuid:userUuid}} 
                    onClick={() => appInsights.trackEvent({
                    name: "clickedPokemonOfType", properties:
                    {
                        pokeId: poke.id, types: [poke.type1, poke.type2],
                        position: index+1, userUuid:userUuid
                    }
                })}>{poke.englishName}</Link></td>
                <td>{poke.type1}</td>
                <td>{poke.type2}</td>
            </tr>
        ))}
        </tbody>
    </Table>
    )
}
  export {tableView,tableViewPoke};