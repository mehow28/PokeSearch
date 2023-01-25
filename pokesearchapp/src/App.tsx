import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { useQuery, useMutation } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { Table, Pagination, Container, InputGroup, FormControl, Button, Form } from 'react-bootstrap';
import { ILongPokemon } from './types/longpoke.type';
import { Pagination as PType} from './types/pagination.type';
import { Link, useSearchParams } from 'react-router-dom';
import { reactPlugin, appInsights } from './appInsights';
import usePrevious from './hooks/usePrevious';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { v4 as uuidv4 } from 'uuid';
import { RootObject } from './types/predictionResult.type';
import loadingView from './components/loadingView';
import tableView from './components/tableView';
import {PREDICTION_URL, API_URL, pokeTypes, thirdCapital, getPrediction} from './components/helperMethods'
import {statPredictionBox,fightPredictionBox} from './components/predictionBoxes';

const App: FC = () => {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [type1, setType1] = useState("");
  const [type2, setType2] = useState("");
  const [checkHandler, setCheckHandler] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSet, setIsSet] = useState(false);
  const prevSearchParams = usePrevious(searchParams);
  const [userUuid, setUserUuid] = useState("");
  const [prediction, setPrediction] = useState("{}");
  const [statEntity, setStatEntity] = useState("");
  const [pokeFromPrediction1, setPokeFromPrediction1] = useState({
      id: 0,
      englishName: '',
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      hp: 0,
      speed: 0,
      type1: '',
      type2: ''
  }) 
  const [pokeFromPrediction2, setPokeFromPrediction2] = useState({
      id: 0,
      englishName: '',
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      hp: 0,
      speed: 0,
      type1: '',
      type2: ''        
    }) 
  const [showStatBox, setShowStatBox] = useState(false);
  const [showFightBox, setShowFightBox] = useState(false);
  
  useEffect(() => {
     let uuid = uuidv4();
     setUserUuid(uuid);
  },[])

  useEffect(() => {
    mutate();
  }, [isSet]);

  useEffect(() => {
    const fetchPokemon = async (pokeName:String) => {
      const res = await fetch(`${API_URL}?q=${pokeName}`).then(res => res.json())
      return res[0]
    }
    let obj: RootObject = JSON.parse(prediction)
    if (obj.result) {
      if (obj.result.prediction.intents[0].confidenceScore > 0.7) {
        if (obj.result.prediction.intents[0].category === "ShowStat") {
          if (obj.result.prediction.entities.length>1) {
            setShowFightBox(false);
            if (obj.result.prediction.entities[0].extraInformation) {
              setStatEntity(obj.result.prediction.entities[0].extraInformation[0].key)
              fetchPokemon(obj.result.prediction.entities[1].text).then(data => setPokeFromPrediction1(data));
            }
            else {
               setStatEntity(obj.result.prediction.entities[1].extraInformation[0].key)
              fetchPokemon(obj.result.prediction.entities[0].text).then(data => setPokeFromPrediction1(data));
            }
            setShowStatBox(true);
          }
        }
        else if (obj.result.prediction.intents[0].category === "CompareTwoPokes") {
          if (obj.result.prediction.entities.length > 1) {
            setShowStatBox(false)
            fetchPokemon(obj.result.prediction.entities[0].text).then(data => setPokeFromPrediction1(data));
            fetchPokemon(obj.result.prediction.entities[1].text).then(data => setPokeFromPrediction2(data));
            setShowFightBox(true)
          }
        }
      }
      else {
        setShowStatBox(false)
        setShowFightBox(false)
      }
    }
  }, [prediction]);

  const checkParamsSet = () => {
      setSearchKey(searchParams.get('q')||'')
      setType1(searchParams.get('type1')||'')
      setType2(searchParams.get('type2')||'')
      setPage(Number(searchParams.get('pageNumber')) || 1) 
  }

  const usePokes = (query: string, type1:string, type2:string, pageNumber: number) => useQuery<ILongPokemon[], Error>(
    ['pokes', pageNumber, isSet, type1, type2],
    () => getPokeList(query, type1, type2, pageNumber),
    { keepPreviousData: true,
      refetchOnMount: true,
    },
  );
 
  const usePokeMutation = (query: string) => useMutation<RootObject, Error>(
    ['mutate', isSet],
    () => getPrediction(query),
    {
      onSuccess: data => {
        setPrediction(JSON.stringify(data));
      }
    }
    )
 
  const { isLoading, data } = usePokes(searchKey, type1, type2, page);
  const { mutate } = usePokeMutation(searchKey);
  

  async function getPokeList(q?: string, t1?: string, t2?: string, pageNumber?: number) {
    const query = `q=${q}&type1=${t1}&type2=${t2}&pageNumber=${pageNumber}`
    let queryUrl = ``;
    let appInsightsHelper = false;
    if (prevSearchParams) {
      setSearchParams(query);
      queryUrl = `${API_URL}?${query}`;
    }
    else { 
      appInsightsHelper = true;
      checkParamsSet();
      queryUrl = `${API_URL}?${searchParams}`;
    }
    const res = await fetch(queryUrl);
    const pagination:PType = JSON.parse(res.headers.get('X-Pagination') ||'{}');
    setPageCount(pagination.TotalPageCount);
    //const resJson = res.json();
    
    if (appInsightsHelper) { 
      appInsights.trackEvent({
      name: "pokeQuery", properties: {
          value: searchParams,//queryUrl.split('?')[1]
          types: [searchParams.get('type1'), searchParams.get('type2')],
          searchPrefix: searchParams.get('q'),
          pageNumber: searchParams.get('pageNumber'),
          numberOfResults: pagination.TotalItemCount,
          userUuid: userUuid,
          fromLink:true
        }
      })
    }
    else {
      appInsights.trackEvent({
      name: "pokeQuery", properties: {
          value: query,//queryUrl.split('?')[1]
          types: [type1, type2],
          searchPrefix: searchKey,
          pageNumber: page,
          numberOfResults: pagination.TotalItemCount,
          userUuid: userUuid,
          fromLink:false
        }
      })
    }
        
    return res.json(); 
  }
 

  const pages = [];
  if (pageCount > 7) {
    pages.push(<Pagination.Item key={1} active={1 === page} onClick={() => setPage(1)}>1</Pagination.Item>)
    pages.push(<Pagination.Ellipsis key={2} />)
    const midpoint = Math.floor(pageCount / 2);
    for (let i = midpoint-2; i <= midpoint+2; i++){
      pages.push(
        <Pagination.Item key={i} active={i === page} onClick={()=>setPage(i)}>
          {i}
        </Pagination.Item>
      );
    }
    pages.push(<Pagination.Ellipsis key={pageCount - 1} />)
    pages.push(<Pagination.Item key={pageCount} active={pageCount === page} onClick={()=>setPage(pageCount)}>{pageCount}</Pagination.Item>)
  }
  else {
    for (let i = 1; i <= pageCount; i++){
      pages.push(
        <Pagination.Item key={i} active={i === page} onClick={()=>setPage(i)}>
          {i}
        </Pagination.Item>
      );
    }  
  }

  const handleCheckChange = (e:any) =>{
    //e.preventDefault();
    if(type1===""){
      console.log("if(type1===)")
      setType1(e);
    }
    else if(type1===e){
      if(type2===""){
        setType1("");
        console.log("else if(type1===e)")
      }
      else{
        setType1(type2);
        setType2("");
        setCheckHandler(!checkHandler)
        console.log("else (type1)")
      }
    }
    else if(type2===""){
      setType2(e);
      setCheckHandler(!checkHandler)
      console.log(" else if(type2===")
    }
    else if(type2===e){
      setType2("");
      setCheckHandler(!checkHandler)
      console.log("else if(type2===e)")
    }
    setPage(1);
  }
  
  const checkChecked = (type: any) => {
    if (searchParams.get('type1') === type ||searchParams.get('type2') === type) {
      return true;
    } else {
      return false;
    } 
  }
  const handleFormSubmit = (e:any) => {
    e.preventDefault();
    setIsSet(!isSet)
  }
  
  return (
    <Container fluid='md'>
     
      <div className="d-flex justify-content-center p-2">
        <Button href="/" variant="outline-dark" size="lg">Pokedex</Button>      
      </div>
    
      <Form onSubmit={e=>handleFormSubmit(e)}>
        <InputGroup className="col-6">
          <FormControl
            type="text"
            value={searchKey}
            onChange={e => setSearchKey(e.target.value)}
            placeholder="Search"
            aria-label="Search"
            aria-describedby="basic-addon2"
          />
          <Button variant="outline-secondary" id="button-addon2" type="submit">
            Search
          </Button>
        </InputGroup>
      </Form>

      <Form>
        {pokeTypes.map((typeList) => (
          <div key={typeList[0]} className="justify-content-md-center">
            {typeList.map((type) => (
              <Form.Check
                inline
                key={type}
                label={type}
                defaultChecked={checkChecked(type)}
                onChange={e=>handleCheckChange(e.target.value)}
                name="group1"
                type='checkbox'
                value={type}
                disabled={!(type===type1||type===type2)&&checkHandler}
              />
            ))}
           </div>  
          ))}
      </Form>
    {showFightBox ? fightPredictionBox(pokeFromPrediction1??'{}',pokeFromPrediction2??'{}') : <div></div> }  
    {showStatBox ? statPredictionBox(pokeFromPrediction1??'{}',statEntity??'{}') : <div></div> } 
    {isLoading ? loadingView() : tableView(userUuid,page,data)}

      <Pagination className="justify-content-md-center">
        <Pagination.First onClick={() => setPage(1)}/>
        <Pagination.Prev onClick={() => { 
          if (page>1) {
            setPage((old) => Math.max(old - 1, 0))
            //checkParamsSet()
          }
        } }/>
          {pages}
        <Pagination.Next onClick={() => {
          if (page<pageCount ) {
            setPage((old) => old + 1);
            //checkParamsSet()
          }
        }}/>
        <Pagination.Last onClick={() => setPage(pageCount)}/>
      </Pagination>
      
    </Container>
  );
}

export default withAITracking(reactPlugin, App);