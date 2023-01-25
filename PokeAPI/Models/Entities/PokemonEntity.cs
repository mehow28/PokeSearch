using Azure;
using Azure.Data.Tables;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokeAPI.Models.Entities
{
    public class PokemonEntity
    {
        public int Id { get; set; }
        public string EnglishName { get; set; }
        public int HP { get; set; }
        public int Attack { get; set; }
        public int Defense { get; set; }
        public int SpAttack { get; set; }
        public int SpDefense { get; set; }
        public int Speed { get; set; }
        public string Type1 { get; set; }
        public string? Type2 { get; set; }
    }
}
