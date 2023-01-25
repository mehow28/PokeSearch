import {Container,Table} from 'react-bootstrap';
import { thirdCapital } from './helperMethods';
import { ILongPokemon } from '../types/longpoke.type';

const statPredictionBox = (pokeFromPrediction1?:any,statEntity?:any) => {
    if(pokeFromPrediction1!=='{}'&&statEntity!=='{}'){
        const Box = () => {
            return (
              <Container className="w-50" fluid='md'>
                <div className="d-flex justify-content-center p-2">
                  {pokeFromPrediction1.englishName}'s {statEntity.toLowerCase() === 'spattack' || statEntity.toLowerCase() === 'spdefense' ? thirdCapital(statEntity) : statEntity.toLowerCase()} is: 
                  {statEntity.toLowerCase() === 'spattack' || statEntity.toLowerCase() === 'spdefense' ? 
                  ' '+pokeFromPrediction1[thirdCapital(statEntity) as keyof ILongPokemon]:
                  ' '+pokeFromPrediction1[statEntity.toLowerCase() as keyof ILongPokemon]}
                </div>
              </Container>
            )}
          const ErrorBox = () => {
            return (
              <Container fluid='md'>
                <div className="d-flex justify-content-center p-2">
                 Loading...
                </div>
              </Container>
            )}
          return (
            <div> {pokeFromPrediction1.id > 0 ?<Box/>:<ErrorBox/>}</div>
          )
    }
    else{
        return(<></>)
    }
}

  const fightPredictionBox = (pokeFromPrediction1?:any,pokeFromPrediction2?:any) => {
    if(pokeFromPrediction1!=='{}'&&pokeFromPrediction2!=='{}'){
        const Box = () => {
            return (
              <Container className="w-50" fluid='md'>
                <div className="d-flex justify-content-center p-2">
                 <Table size="sm">
                  <thead>
                    <tr>
                      <th>*</th>
                      <th>{pokeFromPrediction1.englishName}</th>
                      <th>{pokeFromPrediction2.englishName}</th>
                    </tr>
                    </thead>
                    <tbody>
                      { Object.entries(pokeFromPrediction1).map(([key]) => (
                        !['id', 'englishName', 'type1', 'type2'].includes(key) ?
                        <tr>
                          <td>{key}</td>
                          {pokeFromPrediction1[key as keyof ILongPokemon] > pokeFromPrediction2[key as keyof ILongPokemon] ?
                            <th>{pokeFromPrediction1[key as keyof ILongPokemon]}</th>:
                            <td>{pokeFromPrediction1[key as keyof ILongPokemon]}</td>}
                          {pokeFromPrediction1[key as keyof ILongPokemon] < pokeFromPrediction2[key as keyof ILongPokemon] ?
                            <th>{pokeFromPrediction2[key as keyof ILongPokemon]}</th>:
                            <td>{pokeFromPrediction2[key as keyof ILongPokemon]}</td>}
                        </tr>:<></>
                      ))}
                    </tbody>
                  </Table>  
                </div>
              </Container>
            )}
          const ErrorBox = () => {
            return (
              <Container fluid='md'>
                <div className="d-flex justify-content-start p-2">
                 Loading...
                </div>
              </Container>
            )}
          return (
          <div>
              {(pokeFromPrediction1.id > 0 && pokeFromPrediction2.id > 0) ?<Box/>:<ErrorBox/>}
            </div>
          ) 
        }
        else{
            return(<></>)
        }
    }

export {statPredictionBox,fightPredictionBox}