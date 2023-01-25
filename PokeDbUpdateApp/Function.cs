using System;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Extensions.Http;
using PokemonLibrary;
using static PokemonLibrary.PokemonDto;
using Azure.Storage.Blobs.Models;
using System.Web.Http;

namespace PokeDbUpdateApp
{
    public class Function
    {

        [FunctionName("UpdatePokedex")]
        public async Task UpdatePokedex(
        [TimerTrigger("0 * * * *")] TimerInfo myTimer, ILogger log,
        [Table("PokedexTable", Connection = "AzureWebJobsStorage")] TableClient tableClient,
        [Blob("pokedex", Connection = "AzureWebJobsStorage")] BlobContainerClient inputContainer,
        [Blob("archive", Connection = "AzureWebJobsStorage")] BlobContainerClient outputContainer)
        {
            try
            {
                if (inputContainer.GetBlobClient("pokedex.json").Exists())
                {
                    var pokeBlobClient = inputContainer.GetBlobClient("pokedex.json");
                    try
                    {
                        var pokeBlob = await pokeBlobClient.OpenReadAsync();
                        List<Root> pokemonList = Deserialize<List<Root>>(pokeBlob);
                        //List<PokemonTableEntity> pokeToTable = new List<PokemonTableEntity>();
 
                        foreach (var poke in pokemonList)
                        {
                            var entity = new PokemonTableEntity()
                            {
                                PartitionKey = "Pokemon",
                                RowKey = poke.Id.ToString(),
                                HP = poke.@base.HP,
                                Attack = poke.@base.Attack,
                                Defense = poke.@base.Defense,
                                SpAttack = poke.@base.SpAttack,
                                SpDefense = poke.@base.SpDefense,
                                Speed = poke.@base.Speed,
                                EnglishName = poke.Name.English,
                                Type1 = poke.Type[0]
                            };
                            if (poke.Type.Count() > 1)
                                entity.Type2 = poke.Type[1];
                            //pokeToTable.Add(entity);
                            await tableClient.UpsertEntityAsync(entity);
                        }
                        log.LogInformation("Inserted {pokemonCount} Pokemon", pokemonList.Count().ToString());
                        
                        int count = 0;
                        var pokeDict = pokemonList.ToDictionary(x=>x.Id);

                        foreach (PokemonTableEntity t in tableClient.Query<PokemonTableEntity>(filter: $"PartitionKey eq 'Pokemon'"))
                        {
                            if (!pokeDict.ContainsKey(Convert.ToInt32(t.RowKey)))
                            {
                                await tableClient.DeleteEntityAsync(t.PartitionKey, t.RowKey);
                                log.LogInformation("Deleted Pokemon: {name} id: {id}", t.EnglishName, t.RowKey);
                                count++;
                            }
                        }
                        log.LogInformation("Deleted {deletedPokemonCount} Pokemon", count.ToString());
                        
                        var outputBlobName = "pokedex.imported." + DateTime.Now.ToString("MM-dd-yyyy_HH-mm-ss") + ".json";
                        await outputContainer.GetBlobClient(outputBlobName)
                            .StartCopyFromUriAsync(pokeBlobClient.Uri);
                        await pokeBlobClient.DeleteAsync();
                        
                        log.LogInformation("Moved pokedex/pokedex.json to /archive/{outputBlobName}", outputBlobName);

                    }
                    catch
                    {
                        var outputBlobName = "pokedex.error." + DateTime.Now.ToString("MM-dd-yyyy_HH-mm-ss") + ".json";
                        await outputContainer.GetBlobClient(outputBlobName)
                            .StartCopyFromUriAsync(pokeBlobClient.Uri);
                        await pokeBlobClient.DeleteAsync();

                        log.LogWarning("Error ocured while deserializing pokedex.json. Table unaltered.");
                        log.LogInformation("Moved pokedex/pokedex.json to /archive/{outputBlobName}", outputBlobName);

                    }
                }
                log.LogInformation("pokedex.json not found, table unaltered");
            }
            catch(Exception e)
            {
                log.LogError(e.ToString());
                throw e;
            }
        }

        [FunctionName("CheckTable")]
        public static async Task<IActionResult> CheckTable(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
        [Table("PokedexTable", Connection = "AzureWebJobsStorage")] TableClient tableClient, ILogger log)
        {
            log.LogInformation("testlog?");
            foreach(TableEntity t in tableClient.Query<TableEntity>(filter: $"PartitionKey eq 'Pokemon'"))
            {
                Console.WriteLine(t.GetString("RowKey")+" - "+ t.GetString("EnglishName")+ " - "+ 
                    t.GetInt32("HP").ToString()+ " - "+ t.GetInt32("Attack").ToString()+ " - "+t.GetString("Type1")+" "+ t.GetString("Type2"));
            }
            return new OkObjectResult("git");
        }
        private static T Deserialize<T>(Stream s)
        {
            using (StreamReader reader = new StreamReader(s))
            using (JsonTextReader jsonReader = new JsonTextReader(reader))
            {
                JsonSerializer ser = new JsonSerializer();
                return ser.Deserialize<T>(jsonReader);
            }
        }

    }

}
