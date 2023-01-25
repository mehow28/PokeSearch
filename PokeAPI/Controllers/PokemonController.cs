using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeAPI.Models.Entities;
using PokeAPI.Services.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace PokeAPI.Controllers
{
    [ApiController]
    [Route("api")]
    public class PokemonController : ControllerBase
    {
        private readonly IPokemonRepository _pokemonRepository;
        private readonly ILogger<PokemonController> _logger;
        private readonly IMapper _mapper;
        const int maxPageSize = 20;
        public PokemonController(ILogger<PokemonController> logger, IPokemonRepository pokemonRepository, IMapper mapper)
        {
            _pokemonRepository = pokemonRepository ?? throw new ArgumentNullException(nameof(pokemonRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentException(nameof(mapper));
        }

        [HttpGet]
        [Route("pokemon")]
        [Produces("application/json")]
        public async Task<ActionResult<IEnumerable<PokemonEntity>>> GetPokemons(
            string? q,string? type1, string? type2, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                if (pageSize > maxPageSize)
                    pageSize = maxPageSize;

                var (products, paginationMetadata) = await _pokemonRepository
                    .GetPokemonsAsync(type1, type2, q, pageNumber, pageSize);

                Response.Headers.Add("X-Pagination",
                    JsonSerializer.Serialize(paginationMetadata));
              
                return new JsonResult(products);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex.Message);
                throw new Exception(ex.Message);
            }
        }
        [HttpGet]
        [Route("pokemon/oftype")]
        [Produces("application/json")]
        public async Task<ActionResult<IEnumerable<PokemonShortEntity>>> GetShortPokemons(
            string? type1, string? type2, int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                if (pageSize > maxPageSize)
                    pageSize = maxPageSize;

                var (products, paginationMetadata) = await _pokemonRepository
                    .GetShortPokemonsAsync(type1, type2, pageNumber, pageSize);

                Response.Headers.Add("X-Pagination",
                    JsonSerializer.Serialize(paginationMetadata));

                return new JsonResult(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        [Route("pokemon/{id}")]
        [Produces("application/json")]
        public async Task<ActionResult<PokemonEntity>> GetPokemon(int id)
        {
            try
            {
                var foundPoke = await _pokemonRepository.GetPokemonAsync(id);
                return Ok(_mapper.Map<PokemonEntity>(foundPoke));
            }
            catch
            {
                return NotFound();
            }
        }
    }
}
