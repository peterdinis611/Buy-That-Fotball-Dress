using AuctionService.Entities;
using AuctionService.Mapping;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(
        AuctionDbContext context,
        IPublishEndpoint publishEndpoint,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        await context.Database.MigrateAsync(cancellationToken);

        if (await context.Auctions.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Database already contains auctions, skipping auction seed.");
            await SeedBiddersIfEmptyAsync(context, logger, cancellationToken);
            await BackfillProvenanceAsync(context, publishEndpoint, logger, cancellationToken);
            return;
        }

        var now = DateTime.UtcNow;

        var auctions = new List<Auction>
        {
            new()
            {
                Id = Guid.Parse("c3a1f4d2-8b6e-4c91-9f20-1a7b5e3d8c44"),
                ReservePrice = 250,
                Seller = "kitvault",
                AuctionEnd = now.AddDays(7),
                Status = Status.Live,
                CreatedAt = now.AddDays(-2),
                UpdatedAt = now.AddDays(-2),
                Item = new Item
                {
                    Club = "Real Madrid",
                    PlayerName = "Vinícius Júnior",
                    PlayerNumber = 7,
                    Season = "2024/25",
                    Size = "L",
                    Color = "White",
                    KitType = "Home",
                    Condition = "New",
                    League = "La Liga",
                    ImageUrl = "https://placehold.co/600x800/ffffff/1d3557?text=Real+Madrid+7",
                    Match = "El Clasico",
                    MatchDate = new DateTime(2024, 4, 21, 12, 0, 0, DateTimeKind.Utc),
                    Opponent = "Barcelona",
                    PitchPhotoUrl = "https://placehold.co/800x500/1a5c2a/e8eadc?text=On+the+grass"
                }
            },
            new()
            {
                Id = Guid.Parse("b91e2c77-4d18-4a5f-8c33-6e0f9a12b704"),
                ReservePrice = 320,
                Seller = "campnou.store",
                AuctionEnd = now.AddDays(5),
                Status = Status.Live,
                CreatedAt = now.AddDays(-1),
                UpdatedAt = now.AddDays(-1),
                Item = new Item
                {
                    Club = "Barcelona",
                    PlayerName = "Lamine Yamal",
                    PlayerNumber = 19,
                    Season = "2024/25",
                    Size = "M",
                    Color = "Blue/Red",
                    KitType = "Home",
                    Condition = "New",
                    League = "La Liga",
                    ImageUrl = "https://placehold.co/600x800/a50044/004d98?text=Barca+19"
                }
            },
            new()
            {
                Id = Guid.Parse("0f6c8a21-5e44-4b7d-9c18-2d3a91e5b860"),
                ReservePrice = 180,
                Seller = "anfield.kits",
                AuctionEnd = now.AddDays(10),
                Status = Status.Live,
                CreatedAt = now.AddHours(-12),
                UpdatedAt = now.AddHours(-12),
                Item = new Item
                {
                    Club = "Liverpool",
                    PlayerName = "Mohamed Salah",
                    PlayerNumber = 11,
                    Season = "2024/25",
                    Size = "L",
                    Color = "Red",
                    KitType = "Home",
                    Condition = "New",
                    League = "Premier League",
                    ImageUrl = "https://placehold.co/600x800/c8102e/ffffff?text=LFC+11",
                    Match = "Premier League",
                    MatchDate = new DateTime(2024, 3, 10, 12, 0, 0, DateTimeKind.Utc),
                    Opponent = "Manchester City",
                    PitchPhotoUrl = "https://placehold.co/800x500/1a5c2a/e8eadc?text=On+the+grass"
                }
            },
            new()
            {
                Id = Guid.Parse("7d2e9b54-1c80-4f36-a9d1-5b8c0e4f2173"),
                ReservePrice = 210,
                Seller = "munich.matchworn",
                AuctionEnd = now.AddDays(4),
                Status = Status.Live,
                CreatedAt = now.AddDays(-3),
                UpdatedAt = now.AddDays(-3),
                Item = new Item
                {
                    Club = "Bayern Munich",
                    PlayerName = "Harry Kane",
                    PlayerNumber = 9,
                    Season = "2024/25",
                    Size = "XL",
                    Color = "Red",
                    KitType = "Home",
                    Condition = "Used",
                    League = "Bundesliga",
                    ImageUrl = "https://placehold.co/600x800/dc052d/ffffff?text=Bayern+9"
                }
            },
            new()
            {
                Id = Guid.Parse("e4a70c19-3b56-48d2-91fe-0a6c5d8b9341"),
                ReservePrice = 500,
                Seller = "intermiami.official",
                AuctionEnd = now.AddDays(14),
                Status = Status.Live,
                CreatedAt = now.AddHours(-6),
                UpdatedAt = now.AddHours(-6),
                Item = new Item
                {
                    Club = "Inter Miami",
                    PlayerName = "Lionel Messi",
                    PlayerNumber = 10,
                    Season = "2024",
                    Size = "M",
                    Color = "Pink",
                    KitType = "Home",
                    Condition = "New",
                    League = "MLS",
                    ImageUrl = "https://placehold.co/600x800/f7b5cd/231f20?text=Messi+10"
                }
            },
            new()
            {
                Id = Guid.Parse("1a8d3f62-9e47-4c05-b2d8-7f13e6a90c55"),
                ReservePrice = 90,
                Seller = "oldtrafford.vault",
                AuctionEnd = now.AddDays(8),
                Status = Status.Live,
                CreatedAt = now.AddDays(-4),
                UpdatedAt = now.AddDays(-4),
                Item = new Item
                {
                    Club = "Manchester United",
                    PlayerName = "Eric Cantona",
                    PlayerNumber = 7,
                    Season = "1995/96",
                    Size = "L",
                    Color = "Red",
                    KitType = "Home",
                    Condition = "Vintage",
                    League = "Premier League",
                    ImageUrl = "https://placehold.co/600x800/da291c/ffffff?text=Cantona+7",
                    Match = "FA Cup final",
                    MatchDate = new DateTime(1996, 5, 11, 12, 0, 0, DateTimeKind.Utc),
                    Opponent = "Liverpool",
                    PitchPhotoUrl = "https://placehold.co/800x500/1a5c2a/e8eadc?text=On+the+grass"
                }
            },
            new()
            {
                Id = Guid.Parse("9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466"),
                ReservePrice = 400,
                Seller = "selecao.archive",
                Winner = "kitvault",
                HighBidder = "kitvault",
                SoldAmount = 620,
                CurrentHighBid = 620,
                AuctionEnd = now.AddDays(-1),
                Status = Status.Finished,
                CreatedAt = now.AddDays(-10),
                UpdatedAt = now.AddDays(-1),
                Item = new Item
                {
                    Club = "Brazil",
                    PlayerName = "Ronaldo Nazário",
                    PlayerNumber = 9,
                    Season = "2002",
                    Size = "M",
                    Color = "Yellow",
                    KitType = "Home",
                    Condition = "Vintage",
                    League = "World Cup",
                    ImageUrl = "https://placehold.co/600x800/ffdf00/009c3b?text=Ronaldo+9",
                    Match = "World Cup final",
                    MatchDate = new DateTime(2002, 6, 30, 12, 0, 0, DateTimeKind.Utc),
                    Opponent = "Germany",
                    PitchPhotoUrl = "https://placehold.co/800x500/1a5c2a/ffdf00?text=Yokohama+2002",
                    CollarPhotoUrl = "https://placehold.co/800x500/1a1208/ffdf00?text=Collar",
                    WashPhotoUrl = "https://placehold.co/800x500/1a1208/e8eadc?text=Wash+tag",
                    LabelPhotoUrl = "https://placehold.co/800x500/1a1208/ffdf00?text=Label",
                    CoaUrl = "https://placehold.co/800x1100/f3f1ec/1a1208?text=COA",
                    VerifiedBy = "steward",
                    VerifiedAt = now.AddDays(-8)
                }
            },
            new()
            {
                Id = Guid.Parse("5e7a2c14-8f39-41b6-ad50-2c9d6e1b8077"),
                ReservePrice = 150,
                Seller = "tehelne.kits",
                AuctionEnd = now.AddDays(-2),
                Status = Status.ReserveNotMet,
                CreatedAt = now.AddDays(-9),
                UpdatedAt = now.AddDays(-2),
                CurrentHighBid = 80,
                Item = new Item
                {
                    Club = "Slovan Bratislava",
                    PlayerName = "Vladimír Weiss",
                    PlayerNumber = 7,
                    Season = "2023/24",
                    Size = "M",
                    Color = "White/Blue",
                    KitType = "Home",
                    Condition = "Used",
                    League = "Niké Liga",
                    ImageUrl = "https://placehold.co/600x800/0057b8/ffffff?text=Slovan+7"
                }
            }
        };

        context.Auctions.AddRange(auctions);
        await context.SaveChangesAsync(cancellationToken);

        foreach (var auction in auctions)
            await publishEndpoint.Publish(auction.ToAuctionCreated(), cancellationToken);

        logger.LogInformation("Seeded {Count} auctions.", auctions.Count);
        await SeedBiddersIfEmptyAsync(context, logger, cancellationToken);
    }

    private static async Task SeedBiddersIfEmptyAsync(
        AuctionDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        if (await context.AuctionBidders.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Database already contains bidders, skipping bidder seed.");
            return;
        }

        var now = DateTime.UtcNow;
        var shots = new (Guid AuctionId, string Bidder, int Amount)[]
        {
            (Guid.Parse("0f6c8a21-5e44-4b7d-9c18-2d3a91e5b860"), "kitvault", 200),
            (Guid.Parse("7d2e9b54-1c80-4f36-a9d1-5b8c0e4f2173"), "kitvault", 230),
            (Guid.Parse("c3a1f4d2-8b6e-4c91-9f20-1a7b5e3d8c44"), "campnou.store", 280),
            (Guid.Parse("9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466"), "kitvault", 620),
            (Guid.Parse("5e7a2c14-8f39-41b6-ad50-2c9d6e1b8077"), "kitvault", 80)
        };

        var seeded = 0;
        foreach (var (auctionId, bidder, amount) in shots)
        {
            var auction = await context.Auctions.FirstOrDefaultAsync(x => x.Id == auctionId, cancellationToken);
            if (auction is null)
                continue;

            var exists = await context.AuctionBidders.AnyAsync(
                x => x.AuctionId == auctionId && x.Bidder == bidder,
                cancellationToken);
            if (!exists)
            {
                context.AuctionBidders.Add(new AuctionBidder
                {
                    AuctionId = auctionId,
                    Bidder = bidder
                });
            }

            auction.CurrentHighBid = amount;
            auction.HighBidder = bidder;
            if (auction.Status is Status.Finished)
            {
                auction.Winner = bidder;
                auction.SoldAmount = amount;
            }

            auction.UpdatedAt = now;
            seeded++;
        }

        if (seeded == 0)
            return;

        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded {Count} bidders onto the dressing-room sheet.", seeded);
    }

    private static async Task BackfillProvenanceAsync(
        AuctionDbContext context,
        IPublishEndpoint publishEndpoint,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var shots = new (Guid Id, string Match, DateTime Date, string Opponent, string Pitch, string Collar, string Wash, string Label, string Coa, string Steward)[]
        {
            (Guid.Parse("c3a1f4d2-8b6e-4c91-9f20-1a7b5e3d8c44"), "El Clasico", new DateTime(2024, 4, 21, 12, 0, 0, DateTimeKind.Utc), "Barcelona", "https://placehold.co/800x500/1a5c2a/e8eadc?text=On+the+grass", "", "", "", "", ""),
            (Guid.Parse("0f6c8a21-5e44-4b7d-9c18-2d3a91e5b860"), "Premier League", new DateTime(2024, 3, 10, 12, 0, 0, DateTimeKind.Utc), "Manchester City", "https://placehold.co/800x500/1a5c2a/e8eadc?text=On+the+grass", "", "", "", "", ""),
            (Guid.Parse("1a8d3f62-9e47-4c05-b2d8-7f13e6a90c55"), "FA Cup final", new DateTime(1996, 5, 11, 12, 0, 0, DateTimeKind.Utc), "Liverpool", "https://placehold.co/800x500/1a5c2a/e8eadc?text=On+the+grass", "", "", "", "", ""),
            (Guid.Parse("9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466"), "World Cup final", new DateTime(2002, 6, 30, 12, 0, 0, DateTimeKind.Utc), "Germany", "https://placehold.co/800x500/1a5c2a/ffdf00?text=Yokohama+2002", "https://placehold.co/800x500/1a1208/ffdf00?text=Collar", "https://placehold.co/800x500/1a1208/e8eadc?text=Wash+tag", "https://placehold.co/800x500/1a1208/ffdf00?text=Label", "https://placehold.co/800x1100/f3f1ec/1a1208?text=COA", "steward"),
        };

        var touched = new List<Auction>();
        foreach (var shot in shots)
        {
            var auction = await context.Auctions.Include(x => x.Item).FirstOrDefaultAsync(x => x.Id == shot.Id, cancellationToken);
            if (auction?.Item is null)
                continue;

            var missingGrass = string.IsNullOrWhiteSpace(auction.Item.Match);
            var missingProof = shot.Steward != "" && string.IsNullOrWhiteSpace(auction.Item.VerifiedBy);
            if (!missingGrass && !missingProof)
                continue;

            if (missingGrass)
            {
                auction.Item.Match = shot.Match;
                auction.Item.MatchDate = shot.Date;
                auction.Item.Opponent = shot.Opponent;
                auction.Item.PitchPhotoUrl = shot.Pitch;
            }

            if (missingProof)
            {
                auction.Item.CollarPhotoUrl = shot.Collar;
                auction.Item.WashPhotoUrl = shot.Wash;
                auction.Item.LabelPhotoUrl = shot.Label;
                auction.Item.CoaUrl = shot.Coa;
                auction.Item.VerifiedBy = shot.Steward;
                auction.Item.VerifiedAt = DateTime.UtcNow.AddDays(-8);
            }

            auction.UpdatedAt = DateTime.UtcNow;
            touched.Add(auction);
        }

        if (touched.Count == 0) return;

        await context.SaveChangesAsync(cancellationToken);
        foreach (var auction in touched)
            await publishEndpoint.Publish(auction.ToAuctionUpdated(), cancellationToken);

        logger.LogInformation("Stamped provenance on {Count} shirts.", touched.Count);
    }
}
