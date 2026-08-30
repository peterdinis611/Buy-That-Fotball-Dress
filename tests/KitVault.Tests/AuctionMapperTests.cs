using AuctionService.Mapping;
using KitVault.Tests.Fakes;
using Xunit;

namespace KitVault.Tests;

public class AuctionMapperTests
{
    [Fact]
    public void Create_stamps_provenance_and_uppercases_size()
    {
        var auction = Lots.CreateShirt().ToEntity();

        Assert.Equal("M", auction.Item.Size);
        Assert.Equal("World Cup final", auction.Item.Match);
        Assert.Equal("Germany", auction.Item.Opponent);
        Assert.Equal(new DateTime(2002, 6, 30, 12, 0, 0, DateTimeKind.Utc), auction.Item.MatchDate);
        Assert.Equal("https://placehold.co/grass.png", auction.Item.PitchPhotoUrl);
        Assert.Equal(AuctionService.Entities.Status.Live, auction.Status);
    }

    [Fact]
    public void Create_blank_provenance_becomes_null()
    {
        var auction = Lots.CreateShirt(provenance: false).ToEntity();

        Assert.Null(auction.Item.Match);
        Assert.Null(auction.Item.Opponent);
        Assert.Null(auction.Item.MatchDate);
        Assert.Null(auction.Item.PitchPhotoUrl);
    }

    [Fact]
    public void ApplyUpdate_writes_match_day_onto_the_lot()
    {
        var auction = Lots.CreateShirt(provenance: false).ToEntity();

        auction.ApplyUpdate(new AuctionService.DTOs.UpdateAuctionDto
        {
            Match = "El Clasico",
            Opponent = "Barcelona",
            MatchDate = new DateTime(2024, 4, 21, 12, 0, 0, DateTimeKind.Utc),
            PitchPhotoUrl = "https://placehold.co/pitch.png"
        });

        Assert.Equal("El Clasico", auction.Item.Match);
        Assert.Equal("Barcelona", auction.Item.Opponent);
        Assert.Equal("https://placehold.co/pitch.png", auction.Item.PitchPhotoUrl);
    }

    [Fact]
    public void ApplyUpdate_blank_match_clears_the_stamp()
    {
        var auction = Lots.CreateShirt().ToEntity();

        auction.ApplyUpdate(new AuctionService.DTOs.UpdateAuctionDto { Match = "  " });

        Assert.Null(auction.Item.Match);
    }

    [Fact]
    public void Contract_carries_grass_fields()
    {
        var created = Lots.CreateShirt().ToEntity().ToAuctionCreated();

        Assert.Equal("World Cup final", created.Match);
        Assert.Equal("Germany", created.Opponent);
        Assert.Equal("https://placehold.co/grass.png", created.PitchPhotoUrl);
        Assert.Equal("Ronaldo Nazário", created.PlayerName);
    }
}
