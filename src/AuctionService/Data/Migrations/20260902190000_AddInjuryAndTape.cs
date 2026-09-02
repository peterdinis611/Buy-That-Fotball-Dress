using AuctionService.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuctionService.Data.Migrations
{
    [DbContext(typeof(AuctionDbContext))]
    [Migration("20260902190000_AddInjuryAndTape")]
    public partial class AddInjuryAndTape : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(name: "Injury", table: "Auctions", type: "INTEGER", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<int>(name: "PitToPit", table: "Item", type: "INTEGER", nullable: true);
            migrationBuilder.AddColumn<int>(name: "BackLength", table: "Item", type: "INTEGER", nullable: true);
            migrationBuilder.AddColumn<int>(name: "BackNumber", table: "Item", type: "INTEGER", nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Injury", table: "Auctions");
            migrationBuilder.DropColumn(name: "PitToPit", table: "Item");
            migrationBuilder.DropColumn(name: "BackLength", table: "Item");
            migrationBuilder.DropColumn(name: "BackNumber", table: "Item");
        }
    }
}
