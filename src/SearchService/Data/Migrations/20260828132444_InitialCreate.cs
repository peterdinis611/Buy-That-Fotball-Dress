using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SearchService.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ReservePrice = table.Column<int>(type: "INTEGER", nullable: false),
                    Seller = table.Column<string>(type: "TEXT", nullable: false),
                    Winner = table.Column<string>(type: "TEXT", nullable: true),
                    SoldAmount = table.Column<int>(type: "INTEGER", nullable: true),
                    CurrentHighBid = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AuctionEnd = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Club = table.Column<string>(type: "TEXT", nullable: false),
                    PlayerName = table.Column<string>(type: "TEXT", nullable: false),
                    PlayerNumber = table.Column<int>(type: "INTEGER", nullable: true),
                    Season = table.Column<string>(type: "TEXT", nullable: false),
                    Size = table.Column<string>(type: "TEXT", nullable: false),
                    Color = table.Column<string>(type: "TEXT", nullable: false),
                    KitType = table.Column<string>(type: "TEXT", nullable: false),
                    Condition = table.Column<string>(type: "TEXT", nullable: false),
                    League = table.Column<string>(type: "TEXT", nullable: true),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Items_Club",
                table: "Items",
                column: "Club");

            migrationBuilder.CreateIndex(
                name: "IX_Items_PlayerName",
                table: "Items",
                column: "PlayerName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Items");
        }
    }
}
