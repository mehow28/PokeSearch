using AutoMapper;
using Azure.Data.Tables;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PokeAPI.Models.Entities;
using PokemonLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PokeAPI.Services.Repositories
{
    public class PokemonRepository : IPokemonRepository
    {
        private const string TableName = "PokedexTable";
        private readonly IConfiguration _configuration;
        private readonly ILogger<PokemonRepository> _logger;
        private readonly IMapper _mapper;
        public PokemonRepository(IConfiguration configuration, ILogger<PokemonRepository> logger, IMapper mapper)
        {
            _logger = logger ?? throw new ArgumentException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentException(nameof(configuration));
            _mapper = mapper ?? throw new ArgumentException(nameof(mapper));
        }
        private async Task<TableClient> GetTableClient()
        {
            var serviceClient = new TableServiceClient(_configuration["AzureWebJobsStorage"]);
            var tableClient = serviceClient.GetTableClient(TableName);
            await tableClient.CreateIfNotExistsAsync();
            return tableClient;
        }
        public async Task<(IEnumerable<PokemonShortEntity>, PaginationMetadata)> GetShortPokemonsAsync(string type1, string type2, int pageNumber, int pageSize)
        {
            IEnumerable<PokemonTableEntity> collection;
            TableClient tableClient = await GetTableClient();

            if (!string.IsNullOrEmpty(type1) && !string.IsNullOrEmpty(type2))
            {
                collection = tableClient.Query<PokemonTableEntity>(filter: $"Type1 eq '{type1}' and Type2 eq '{type2}'");
            }
            else
            {
                collection = tableClient.Query<PokemonTableEntity>(filter: $"Type1 eq '{type1}'");
            }
            var mappedCol = _mapper.Map<IEnumerable<PokemonShortEntity>>(collection);
            var totalItemCount = mappedCol.Count();

            _logger.LogInformation("Type match query has {httpGetShortPokeCount} matching Pokemon", totalItemCount);

            var paginationMetadata = new PaginationMetadata(
                totalItemCount, pageSize, pageNumber);

            var retCol = mappedCol
                .OrderBy(c => c.Id)
                .Skip(pageSize * (pageNumber - 1))
                .Take(pageSize)
                .ToList();

            return (retCol, paginationMetadata);
        }

        public async Task<(IEnumerable<PokemonEntity>, PaginationMetadata)> GetPokemonsAsync(string type1, string type2, string searchQuery, int pageNumber, int pageSize)
        {
            IEnumerable<PokemonTableEntity> collection;
            TableClient tableClient = await GetTableClient();
            if (!string.IsNullOrEmpty(searchQuery))
            {
                if (!string.IsNullOrEmpty(type1) && !string.IsNullOrEmpty(type2))
                {
                    type1 = char.ToUpper(type1[0]) + type1.Substring(1);
                    type2 = char.ToUpper(type2[0]) + type2.Substring(1);
                    var q1 = tableClient.Query<PokemonTableEntity>(filter: $"(Type1 eq '{type1}' or Type1 eq '{type2}') and (Type2 eq '{type2}' or Type2 eq '{type1}')");
                    collection = q1.ToList().Where(poke => poke.EnglishName.ToLower().Contains(searchQuery.ToLower()));
                }
                else if (!string.IsNullOrEmpty(type1))
                {
                    type1 = char.ToUpper(type1[0]) + type1.Substring(1);
                    var q1 = tableClient.Query<PokemonTableEntity>(filter: $"Type1 eq '{type1}' or Type2 eq '{type1}'");
                    collection = q1.ToList().Where(poke => poke.EnglishName.ToLower().Contains(searchQuery.ToLower()));
                }
                else
                {
                    var q1 = tableClient.Query<PokemonTableEntity>(filter: $"PartitionKey eq 'Pokemon'");
                    collection = q1.ToList().Where(poke => poke.EnglishName.ToLower().Contains(searchQuery.ToLower()));
                }
            }
            else
            {
                if (!string.IsNullOrEmpty(type1) && !string.IsNullOrEmpty(type2))
                {
                    type1 = char.ToUpper(type1[0]) + type1.Substring(1);
                    type2 = char.ToUpper(type2[0]) + type2.Substring(1);
                    collection = tableClient.Query<PokemonTableEntity>(filter: $"(Type1 eq '{type1}' or Type1 eq '{type2}') and (Type2 eq '{type2}' or Type2 eq '{type1}')");
                }
                else if (!string.IsNullOrEmpty(type1))
                {
                    type1 = char.ToUpper(type1[0]) + type1.Substring(1);
                    collection = tableClient.Query<PokemonTableEntity>(filter: $"Type1 eq '{type1}' or Type2 eq '{type1}'");
                }
                else
                {
                    collection = tableClient.Query<PokemonTableEntity>(filter: $"PartitionKey eq 'Pokemon'").ToList();
                }
            }
            var mappedCol = _mapper.Map<IEnumerable<PokemonEntity>>(collection);
            var totalItemCount = mappedCol.Count();
            
            _logger.LogInformation("Query has {httpGetPokeCount} matching Pokemon", totalItemCount);
            
            var paginationMetadata = new PaginationMetadata(
                totalItemCount, pageSize, pageNumber);

            var retCol = mappedCol
                .OrderBy(c => c.Id)
                .Skip(pageSize * (pageNumber - 1))
                .Take(pageSize)
                .ToList();

            return (retCol, paginationMetadata);
        }

        public async Task<PokemonTableEntity> GetPokemonAsync(int id)
        {
            TableClient tableClient = await GetTableClient();
            return await tableClient.GetEntityAsync<PokemonTableEntity>("Pokemon", id.ToString());
        }
    }
}
