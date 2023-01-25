using Azure;
using Azure.Data.Tables;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokemonLibrary
{
    // Root myDeserializedClass = JsonConvert.DeserializeObject<List<Root>>(myJsonResponse);
    public class PokemonTableEntity : ITableEntity
    {
        [NotMapped]
        //taki sam dla wszystkich?
        public string PartitionKey { get; set; }
        //id?
        public string RowKey { get; set; }
        public int HP { get; set; }
        public int Attack { get; set; }
        public int Defense { get; set; }
        public int SpAttack { get; set; }
        public int SpDefense { get; set; }
        public int Speed { get; set; }
        public string EnglishName { get; set; }
        public string Type1 { get; set; }
        public string? Type2 { get; set; }
        [NotMapped]
        public DateTimeOffset? Timestamp { get; set; }
        [NotMapped]
        public ETag ETag { get; set; }
    }
}
