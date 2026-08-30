using AuctionService.Mapping;
using KitVault.Tests.Fakes;
using SearchService.Data;
using SearchService.DTOs;
using SearchService.Mapping;
using SearchService.Validation;
using Xunit;

namespace KitVault.Tests;

public class SearchTests
{
    private readonly ItemValidator items = new();
    private readonly SearchQueryValidator queries = new();

    [Fact]
    public void Valid_worn_shirt_passes()
    {
        Assert.True(items.Validate(Lots.SearchItem()).IsValid);
    }

    [Fact]
    public void Pitch_photo_must_be_https()
    {
        var item = Lots.SearchItem();
        item.PitchPhotoUrl = "http://placehold.co/grass.png";

        var result = items.Validate(item);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, x => x.PropertyName == nameof(item.PitchPhotoUrl));
    }

    [Fact]
    public void Match_name_has_a_ceiling()
    {
        var item = Lots.SearchItem();
        item.Match = new string('x', JerseyRules.MaxMatchLength + 1);

        Assert.False(items.Validate(item).IsValid);
    }

    [Fact]
    public void Status_must_be_a_real_board_state()
    {
        var item = Lots.SearchItem();
        item.Status = "Pending";

        Assert.False(items.Validate(item).IsValid);
    }

    [Fact]
    public void Empty_search_is_fine()
    {
        Assert.True(queries.Validate(new SearchQuery()).IsValid);
    }

    [Fact]
    public void Min_price_cannot_sit_above_max()
    {
        var result = queries.Validate(new SearchQuery { MinPrice = 500, MaxPrice = 100 });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void Page_zero_is_out()
    {
        Assert.False(queries.Validate(new SearchQuery { Page = 0 }).IsValid);
    }

    [Fact]
    public void Created_event_keeps_the_grass()
    {
        var item = Lots.CreateShirt().ToEntity().ToAuctionCreated().ToItem();

        Assert.Equal("World Cup final", item.Match);
        Assert.Equal("Germany", item.Opponent);
        Assert.Equal("https://placehold.co/grass.png", item.PitchPhotoUrl);
    }

    [Fact]
    public async Task Repository_finds_a_club_and_skips_the_rest()
    {
        await using var sqlite = SqliteHarness.Search();
        var repo = new ItemRepository(sqlite.Db, new MemoryPitchCache());
        await repo.UpsertAsync(Lots.SearchItem(club: "Brazil"), default);
        await repo.UpsertAsync(Lots.SearchItem(club: "Real Madrid", player: "Vinícius Júnior"), default);

        var page = await repo.SearchAsync(new SearchQuery { Club = "Brazil" }, default);

        Assert.Equal(1, page.TotalCount);
        Assert.Equal("Ronaldo Nazário", page.Results[0].PlayerName);
    }

    [Fact]
    public async Task Repository_deletes_the_lot()
    {
        await using var sqlite = SqliteHarness.Search();
        var repo = new ItemRepository(sqlite.Db, new MemoryPitchCache());
        var item = Lots.SearchItem();
        await repo.UpsertAsync(item, default);

        await repo.DeleteAsync(item.Id, default);

        Assert.Equal(0, await repo.CountAsync(default));
    }
}
