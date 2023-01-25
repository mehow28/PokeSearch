using Newtonsoft.Json;
using System.Collections.Generic;

namespace PokemonLibrary
{
    public class PokemonDto
    {
        // Root myDeserializedClass = JsonConvert.DeserializeObject<List<Root>>(myJsonResponse);
        public class Base
        {
            public int HP { get; set; }
            public int Attack { get; set; }
            public int Defense { get; set; }

            [JsonProperty("Sp. Attack")]
            public int SpAttack { get; set; }

            [JsonProperty("Sp. Defense")]
            public int SpDefense { get; set; }
            public int Speed { get; set; }
        }

        public class Name
        {
            public string English { get; set; }
            public string Japanese { get; set; }
            public string Chinese { get; set; }
            public string French { get; set; }
        }

        public class Root
        {
            public int Id { get; set; }
            public Name Name { get; set; }
            public List<string> Type { get; set; }
            public Base @base { get; set; }
        }


    }
}
