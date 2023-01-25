import { Link, useParams } from "react-router-dom";
import { ILongPokemon } from './types/longpoke.type';
import { FC, useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { appInsights, reactPlugin } from './appInsights';
import { withAITracking } from "@microsoft/applicationinsights-react-js";
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from 'react-router-dom'

const API_URL = 'https://pokesearchapidev.azurewebsites.net/api/pokemon';

const PokemonView: FC = () => {
    const [pokemon, setPokemon] = useState<ILongPokemon>();
    const [fetchId, setFetchId] = useState("");
    const [type1, setType1] = useState("");
    const [type2, setType2] = useState("");
    const idPar = useParams().pokeId
    const location = useLocation();
    const { userUuid } = location.state || uuidv4();
    // let userUuid = "";

    // if (location.state.userUuid == null) {
    //     userUuid = uuidv4();
        
    // }
    // else {
    //     userUuid = location.state.userUuid;
    // }

    // console.log(idPar)

    useEffect(() => {
        appInsights.trackEvent({
                name: "pokemonViewVisit", properties: { pokeId: idPar, userUuid:userUuid  }
            })
       
        // if (userUuid != null) {
        //     appInsights.trackEvent({
        //             name: "pokemonViewVisit", properties: { pokeId: idPar, userUuid:userUuid  }
        //         }) 
        // }
        // else {
        //     appInsights.trackEvent({
        //         name: "pokemonViewVisit", properties: { pokeId: idPar, userUuid:uuidv4() }
        //     })
        // }
    },[])

    const setPokemonInfo = (poke: any) => {
        setPokemon(poke)
        setFetchId(poke.id.toString() || "")
        setType1(poke.type1||"")
        setType2(poke.type2 || "")
        //refetch()
    }
    const getOnePoke = async (id: string) => {
        const res = await fetch(`${API_URL}/${id}`);
        return res.json();
    }
    
    async function getPokeList(id?: string, t1?: string, t2?: string) {
        const query = `id=${id}&type1=${t1}&type2=${t2}`
        const queryUrl = `${API_URL}/oftype?${query}`;
        const res = await fetch(queryUrl);
        return res.json();
    }
        
    const usePoke = (id: string) => useQuery<ILongPokemon, Error>(
        ['poke', idPar],
        () => getOnePoke(id),
        {
            keepPreviousData:false
        }
    )
    
    const usePokes = (id:string, type1:string, type2:string) => useQuery<ILongPokemon[], Error>(
        ['pokes',id,type1,type2],
        () => getPokeList(id, type1, type2),
        {
            keepPreviousData: false,
        },
        );
        
    const loadingView = () => {
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
            <tr>
            <td>Loading...</td>
            <td>Loading...</td>
            <td>Loading...</td>
            <td>Loading...</td>
            </tr>
        </tbody>
        </Table>
        )
    }
    
    const tableView = () => {
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
    
    
    const {status,data:pokemonData} = usePoke(idPar||"")
    const {isLoading,data} = usePokes(fetchId,type1,type2)
    
    useEffect(() => {
        if (status==='success') {
            setPokemonInfo(pokemonData);
            console.log("hi!")
        }
        //getPoke().then((poke) => setPokemonInfo(poke)).then(()=>setPar(idPar))
    }, [status,pokemonData])
    
    console.log(status)
    if (!pokemon) {
        return (
            <div></div>
            )
        }
        else {       
            return (
                <Container fluid='md'>
                <div className="d-flex justify-content-center p-2">
                    <Button href="/" variant="outline-dark" size="lg">Pokedex</Button>       
                </div>
                <Row>
                <Col xs="4">
                        <h1>{pokemon.englishName}</h1>
                        <h6>hp: {pokemon.id}</h6>
                        <h6>attack: {pokemon.attack}</h6>
                        <h6>defense: {pokemon.defense}</h6>
                        <h6>spAttack: {pokemon.spAttack}</h6>
                        <h6>spDefense: {pokemon.spDefense}</h6>
                        <h6>speed: {pokemon.speed}</h6>
                        <h6>type: {pokemon.type1}</h6>
                        { pokemon.type2 ? <h6>type 2: {pokemon.type2}</h6> : null}
                </Col>
                <Col xs="8">
                     {isLoading ? loadingView() : tableView()}
                </Col >
                </Row>
            </Container>
        )
    }
};
    

export default withAITracking(reactPlugin, PokemonView);