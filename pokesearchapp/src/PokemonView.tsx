import { Link, useParams } from "react-router-dom";
import { ILongPokemon } from './types/longpoke.type';
import { FC, useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { appInsights, reactPlugin } from './appInsights';
import { withAITracking } from "@microsoft/applicationinsights-react-js";
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from 'react-router-dom'
import {tableViewPoke} from "./components/tableView";
import loadingView from "./components/loadingView";

const API_URL = 'https://<XXX>.azurewebsites.net/api/pokemon';

const PokemonView: FC = () => {
    const [pokemon, setPokemon] = useState<ILongPokemon>();
    const [fetchId, setFetchId] = useState("");
    const [type1, setType1] = useState("");
    const [type2, setType2] = useState("");
    const idPar = useParams().pokeId
    const location = useLocation();
    const { userUuid } = location.state || uuidv4();
   
    useEffect(() => {
        appInsights.trackEvent({
                name: "pokemonViewVisit", properties: { pokeId: idPar, userUuid:userUuid  }
            })
    },[])

    const setPokemonInfo = (poke: any) => {
        setPokemon(poke)
        setFetchId(poke.id.toString() || "")
        setType1(poke.type1||"")
        setType2(poke.type2 || "")
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
    
    const {status,data:pokemonData} = usePoke(idPar||"")
    const {isLoading,data} = usePokes(fetchId,type1,type2)
    
    useEffect(() => {
        if (status==='success') {
            setPokemonInfo(pokemonData);
            console.log("hi!")
        }
    }, [status,pokemonData])
    
    console.log(status)
    if (!pokemon) {
        return (
            <></>
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
                     {isLoading ? loadingView() : tableViewPoke(userUuid,data)}
                </Col >
                </Row>
            </Container>
        )
    }
};
    

export default withAITracking(reactPlugin, PokemonView);