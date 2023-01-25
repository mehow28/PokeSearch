using PokeAPI.Models.Entities;
using PokemonLibrary;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PokeAPI.Services.Repositories
{
    public interface IPokemonRepository
    {

        Task<(IEnumerable<PokemonEntity>, PaginationMetadata)> GetPokemonsAsync(string type1, string type2, string searchQuery, int pageNumber, int pageSize);
        Task<(IEnumerable<PokemonShortEntity>, PaginationMetadata)> GetShortPokemonsAsync(string type1, string type2, int pageNumber, int pageSize);
        Task<PokemonTableEntity> GetPokemonAsync(int id);
    }
}
