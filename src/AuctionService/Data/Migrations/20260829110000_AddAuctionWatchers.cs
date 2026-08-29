using System;
using AuctionService.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuctionService.Data.Migrations
{
    [DbContext(typeof(AuctionDbContext))]
    [Migration("20260829110000_AddAuctionWatchers")]
    public partial class AddAuctionWatchers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuctionWatchers",
                columns: table => new
                {
                    AuctionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Watcher = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuctionWatchers", x => new { x.AuctionId, x.Watcher });
                    table.ForeignKey(
                        name: "FK_AuctionWatchers_Auctions_AuctionId",
                        column: x => x.AuctionId,
                        principalTable: "Auctions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuctionWatchers_Watcher",
                table: "AuctionWatchers",
                column: "Watcher");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "AuctionWatchers");
        }
    }
}
