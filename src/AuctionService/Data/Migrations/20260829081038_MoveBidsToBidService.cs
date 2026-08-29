using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuctionService.Data.Migrations
{
    /// <inheritdoc />
    public partial class MoveBidsToBidService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuctionBidders",
                columns: table => new
                {
                    AuctionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Bidder = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuctionBidders", x => new { x.AuctionId, x.Bidder });
                    table.ForeignKey(
                        name: "FK_AuctionBidders_Auctions_AuctionId",
                        column: x => x.AuctionId,
                        principalTable: "Auctions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuctionBidders_Bidder",
                table: "AuctionBidders",
                column: "Bidder");

            migrationBuilder.Sql("""
                INSERT OR IGNORE INTO AuctionBidders (AuctionId, Bidder)
                SELECT DISTINCT AuctionId, Bidder FROM Bids;
                """);

            migrationBuilder.DropTable(
                name: "Bids");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuctionBidders");

            migrationBuilder.CreateTable(
                name: "Bids",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    AuctionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Amount = table.Column<int>(type: "INTEGER", nullable: false),
                    Bidder = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bids", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bids_Auctions_AuctionId",
                        column: x => x.AuctionId,
                        principalTable: "Auctions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_AuctionId_Amount",
                table: "Bids",
                columns: new[] { "AuctionId", "Amount" });

            migrationBuilder.CreateIndex(
                name: "IX_Bids_Bidder",
                table: "Bids",
                column: "Bidder");
        }
    }
}
