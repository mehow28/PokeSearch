using AutoMapper;
using PokeAPI.Models.Entities;
using PokemonLibrary;
using System;

namespace PokeAPI.Profiles
{
    public class MappingProfiles:Profile
    {
        public MappingProfiles()
        {
            CreateMap<PokemonTableEntity, PokemonEntity>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Int32.Parse(src.RowKey)));
            CreateMap<PokemonTableEntity, PokemonShortEntity>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Int32.Parse(src.RowKey)));
        }
    }
}
