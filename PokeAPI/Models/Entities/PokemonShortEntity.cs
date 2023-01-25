using Azure;
using Azure.Data.Tables;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokeAPI.Models.Entities
{
    public class PokemonShortEntity
    {
        public int Id { get; set; }
        public string EnglishName { get; set; }
        public string Type1 { get; set; }
        public string? Type2 { get; set; }
    }
}
